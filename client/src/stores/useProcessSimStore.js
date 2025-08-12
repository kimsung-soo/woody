// src/stores/useProcessSimStore.js
import { defineStore } from 'pinia';
import { reactive, computed } from 'vue';

export const PROCESS_LIST = [
  { code: 'CUT', name: '재단' },
  { code: 'FAB', name: '가공' },
  { code: 'POL', name: '연마' },
  { code: 'PAI', name: '도장' },
  { code: 'ASM', name: '조립' }
];

function pad2(n) {
  return String(n).padStart(2, '0');
}

function makeOrders() {
  const items = [];
  const products = [
    { code: 'P001', name: '블랙 데스크', type: '완제품' },
    { code: 'P002', name: '화이트 데스크', type: '반제품' },
    { code: 'P003', name: '라운드 테이블', type: '완제품' },
    { code: 'P004', name: '협탁', type: '반제품' }
  ];
  for (let i = 0; i < 8; i++) {
    const p = products[i % products.length];
    const d = new Date(2025, 6 + (i % 2), 5 + i);
    const issue = `WO-2025${pad2(d.getMonth() + 1)}${pad2(d.getDate())}-${3000 + i}`;
    const procInit = {};
    PROCESS_LIST.forEach((pr) => {
      if (p.type === '반제품' && pr.code === 'ASM') return;
      procInit[pr.code] = { status: 'WAIT', progress: 0, startedAt: null, endedAt: null, worker: null, equipIds: [] };
    });
    items.push({
      id: 1000 + i,
      issueNumber: issue,
      productCode: p.code,
      productName: p.name,
      productType: p.type,
      targetQty: 100 + (i % 4) * 50,
      producedQty: 0,
      get remainingQty() {
        return Math.max(0, this.targetQty - this.producedQty);
      },
      processes: procInit
    });
  }
  return items;
}

function makeWorkers() {
  return [
    { id: 'EMP-101', name: '이성민', dept: '생산' },
    { id: 'EMP-102', name: '박지현', dept: '생산' },
    { id: 'EMP-103', name: '김성수', dept: '생산' },
    { id: 'EMP-104', name: '최윤수', dept: '생산' }
  ];
}

function makeEquipments() {
  const arr = [];
  const base = [
    { code: 'CUT', prefix: 'CUT', name: '절단기' },
    { code: 'FAB', prefix: 'FAB', name: '가공기' },
    { code: 'POL', prefix: 'POL', name: '연마기' },
    { code: 'PAI', prefix: 'PAI', name: '도장기' },
    { code: 'ASM', prefix: 'ASM', name: '조립대' }
  ];
  let id = 1;
  base.forEach((b) => {
    for (let i = 1; i <= 4; i++) {
      arr.push({
        id: `EQ-${id++}`,
        code: `${b.prefix}-${i}`,
        name: `${b.name}-${i}`,
        process: b.code,
        status: '사용가능'
      });
    }
  });
  return arr;
}

export const useProcessSimStore = defineStore('process-sim', () => {
  const orders = reactive(makeOrders());
  const workers = reactive(makeWorkers());
  const equipments = reactive(makeEquipments());
  const jobs = reactive([]); // { id, orderId, process, inputQty, startTime, durationMs, progress }

  const flatRowsForStatus = computed(() => {
    const rows = [];
    orders.forEach((o) => {
      Object.entries(o.processes).forEach(([proc, st]) => {
        rows.push({
          orderId: o.id,
          issueNumber: o.issueNumber,
          productName: o.productName,
          productType: o.productType,
          process: proc,
          processName: PROCESS_LIST.find((p) => p.code === proc)?.name || proc,
          state: st.status,
          progress: st.progress,
          targetQty: o.targetQty,
          producedQty: o.producedQty,
          remainingQty: o.remainingQty,
          start: st.startedAt,
          end: st.endedAt
        });
      });
    });
    return rows;
  });

  function startJob({ orderId, process, workerId, equipIds, inputQty, durationSec = 30 }) {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return { ok: false, msg: '지시 없음' };
    if (!ord.processes[process]) return { ok: false, msg: '해당 공정이 지시에 없음' };
    if (ord.remainingQty <= 0) return { ok: false, msg: '남은수량 없음' };
    if (inputQty <= 0 || inputQty > ord.remainingQty) return { ok: false, msg: '투입량이 올바르지 않음' };

    const ps = ord.processes[process];
    ps.status = 'RUN';
    ps.worker = workerId;
    ps.equipIds = equipIds || [];
    ps.startedAt = new Date().toISOString();
    ps.endedAt = null;
    ps.progress = 0;

    jobs.push({
      id: `${orderId}-${process}-${Date.now()}`,
      orderId,
      process,
      inputQty,
      startTime: performance.now(),
      durationMs: durationSec * 1000,
      progress: 0
    });
    return { ok: true };
  }

  function pauseJob(orderId, process) {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord || !ord.processes[process]) return;
    const ps = ord.processes[process];
    ps.status = 'PAUSE';
    ps.endedAt = new Date().toISOString();
    const idx = jobs.findIndex((j) => j.orderId === orderId && j.process === process);
    if (idx >= 0) jobs.splice(idx, 1);
  }

  function finishJob(orderId, process) {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord || !ord.processes[process]) return;
    const ps = ord.processes[process];
    ps.status = 'DONE';
    ps.progress = 100;
    ps.endedAt = new Date().toISOString();
    const idx = jobs.findIndex((j) => j.orderId === orderId && j.process === process);
    if (idx >= 0) {
      ord.producedQty = Math.min(ord.targetQty, ord.producedQty + jobs[idx].inputQty);
      jobs.splice(idx, 1);
    }
  }

  function tick(now) {
    for (let i = jobs.length - 1; i >= 0; i--) {
      const j = jobs[i];
      const ord = orders.find((o) => o.id === j.orderId);
      if (!ord) {
        jobs.splice(i, 1);
        continue;
      }
      const ps = ord.processes[j.process];
      const p = Math.min(100, Math.round(((now - j.startTime) / j.durationMs) * 100));
      j.progress = p;
      ps.progress = p;
      if (p >= 100) {
        ord.producedQty = Math.min(ord.targetQty, ord.producedQty + j.inputQty);
        ps.status = 'DONE';
        ps.endedAt = new Date().toISOString();
        jobs.splice(i, 1);
      }
    }
  }

  function resetAll() {
    const fresh = makeOrders();
    orders.splice(0, orders.length, ...fresh);
    jobs.splice(0, jobs.length);
  }

  return {
    PROCESS_LIST,
    orders,
    workers,
    equipments,
    jobs,
    flatRowsForStatus,
    startJob,
    pauseJob,
    finishJob,
    tick,
    resetAll
  };
});
