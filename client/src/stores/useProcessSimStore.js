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

function requiredCodes(productType) {
  // 반제품은 ASM 제외
  return PROCESS_LIST.filter((p) => !(productType === '반제품' && p.code === 'ASM')).map((p) => p.code);
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
      procInit[pr.code] = {
        status: 'WAIT', // WAIT/RUN/PAUSE/DONE
        progress: 0, // % (해당 공정의 진행률)
        prodQty: 0, // 공정별 누적 생산량
        inProgress: null, // { inputQty, doneQty, startAt, endAt, workerId, equipIds }
        startedAt: null,
        endedAt: null,
        worker: null,
        equipIds: []
      };
    });

    items.push({
      id: 1000 + i,
      issueNumber: issue,
      productCode: p.code,
      productName: p.name,
      productType: p.type,
      targetQty: 100 + (i % 4) * 50,
      // 아래 producedQty는 "전체 기생산량" (필요 공정들의 최소 prodQty)로 유지
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
    { id: 'EMP-104', name: '최은수', dept: '생산' }
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

// 필요 공정들의 최소 prodQty가 해당 지시의 "전체 기생산량"
function producedOverall(order) {
  const codes = requiredCodes(order.productType);
  if (codes.length === 0) return 0;
  const list = codes.map((c) => order.processes[c]?.prodQty ?? 0);
  return Math.max(0, Math.min(order.targetQty, Math.min(...list)));
}

export const useProcessSimStore = defineStore('process-sim', () => {
  const orders = reactive(makeOrders());
  const workers = reactive(makeWorkers());
  const equipments = reactive(makeEquipments());
  // 실행 중 잡(한 공정당 하나만 가정)
  // { id, orderId, process, inputQty, startTime, durationMs, progress }
  const jobs = reactive([]);

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
          producedQty: o.producedQty, // 전체 기생산량(필요 공정 최소)
          remainingQty: o.remainingQty,
          start: st.startedAt,
          end: st.endedAt
        });
      });
    });
    return rows;
  });

  function _recalcProcProgress(order, process) {
    const rt = order.processes[process];
    // 공정 진행률 = (해당 공정 누적 prodQty / target) * 100
    const pct = Math.floor((rt.prodQty / Math.max(order.targetQty, 1)) * 100);
    rt.progress = Math.max(0, Math.min(100, pct));
    if (rt.progress >= 100) rt.status = 'DONE';
  }

  function _recalcOrderProduced(order) {
    order.producedQty = producedOverall(order);
  }

  function _overallRemaining(order) {
    return Math.max(order.targetQty - producedOverall(order), 0);
  }

  function startJob({ orderId, process, workerId, equipIds, inputQty, durationSec = 30 }) {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return { ok: false, msg: '지시 없음' };
    const ps = ord.processes[process];
    if (!ps) return { ok: false, msg: '해당 공정이 지시에 없음' };

    // 일시정지 상태에서 "이어하기"
    if (ps.status === 'PAUSE' && ps.inProgress) {
      const remain = Math.max(ps.inProgress.inputQty - ps.inProgress.doneQty, 0);
      if (remain <= 0) return { ok: false, msg: '남은 투입량 없음(종료로 확정하세요)' };
      ps.status = 'RUN';
      ps.startedAt = new Date().toISOString();
      ps.worker = workerId;
      ps.equipIds = (equipIds || []).slice();

      jobs.push({
        id: `${orderId}-${process}-${Date.now()}`,
        orderId,
        process,
        inputQty: remain,
        startTime: performance.now(),
        durationMs: durationSec * 1000,
        progress: 0
      });
      return { ok: true };
    }

    // 신규 시작
    const overallRemain = _overallRemaining(ord);
    if (overallRemain <= 0) return { ok: false, msg: '남은수량 없음' };
    const want = Math.min(Math.max(inputQty || 0, 0), overallRemain);
    if (want <= 0) return { ok: false, msg: '투입량이 올바르지 않음' };

    ps.status = 'RUN';
    ps.worker = workerId;
    ps.equipIds = (equipIds || []).slice();
    ps.startedAt = new Date().toISOString();
    ps.endedAt = null;
    // 새 작업 inProgress 생성
    ps.inProgress = {
      inputQty: want,
      doneQty: 0,
      startAt: ps.startedAt,
      endAt: null,
      workerId,
      equipIds: (equipIds || []).slice()
    };

    jobs.push({
      id: `${orderId}-${process}-${Date.now()}`,
      orderId,
      process,
      inputQty: want,
      startTime: performance.now(),
      durationMs: durationSec * 1000,
      progress: 0
    });
    return { ok: true };
  }

  function pauseJob(orderId, process) {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;
    const ps = ord.processes[process];
    if (!ps || ps.status !== 'RUN') return;

    // 실행 중 job 찾기
    const idx = jobs.findIndex((j) => j.orderId === orderId && j.process === process);
    if (idx >= 0) {
      const j = jobs[idx];
      // 현재까지의 부분완료량
      const partialDone = Math.max(0, Math.round((j.progress / 100) * j.inputQty));
      if (ps.inProgress) {
        ps.inProgress.doneQty = Math.min(ps.inProgress.inputQty, (ps.inProgress.doneQty || 0) + partialDone);
        ps.inProgress.endAt = new Date().toISOString();
      }
      jobs.splice(idx, 1);
    }

    ps.status = 'PAUSE';
    ps.endedAt = new Date().toISOString();
  }

  function finishJob(orderId, process) {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;
    const ps = ord.processes[process];
    if (!ps) return;

    // 실행 중 job 정리
    const idx = jobs.findIndex((j) => j.orderId === orderId && j.process === process);
    let addQty = 0;
    if (idx >= 0) {
      const j = jobs[idx];
      // 진행 중이던 퍼센트만큼 완료 처리
      const partialDone = Math.max(0, Math.round((j.progress / 100) * j.inputQty));
      addQty += partialDone;
      jobs.splice(idx, 1);
    }

    // inProgress 남은 양(확정) 더하기
    if (ps.inProgress) {
      // 남은분(입력량 - done)을 전부 완료로 본다(확정 종료 시)
      const remain = Math.max(ps.inProgress.inputQty - (ps.inProgress.doneQty || 0), 0);
      addQty += remain;
      ps.inProgress.endAt = new Date().toISOString();
      ps.inProgress = null;
    }

    if (addQty > 0) {
      // 공정별 누적 반영 (target 초과 방지)
      const canAdd = Math.max(ord.targetQty - ps.prodQty, 0);
      const realAdd = Math.min(addQty, canAdd);
      ps.prodQty += realAdd;
    }

    // 공정 진행률 재계산 및 상태
    _recalcProcProgress(ord, process);

    // 전체 기생산량(필요 공정 최소) 재계산 → remainingQty도 자동 반영(getter)
    _recalcOrderProduced(ord);

    // RUN이면 잔량 남아있는 것 → IDLE 로 전환 (100%면 DONE)
    if (ps.progress >= 100) {
      ps.status = 'DONE';
    } else {
      ps.status = 'IDLE';
    }

    ps.endedAt = new Date().toISOString();
  }

  function tick(now) {
    // 애니메이션/시뮬레이션용 타이머 틱
    for (let i = jobs.length - 1; i >= 0; i--) {
      const j = jobs[i];
      const ord = orders.find((o) => o.id === j.orderId);
      if (!ord) {
        jobs.splice(i, 1);
        continue;
      }
      const ps = ord.processes[j.process];
      if (!ps) {
        jobs.splice(i, 1);
        continue;
      }

      const p = Math.min(100, Math.round(((now - j.startTime) / j.durationMs) * 100));
      j.progress = p;

      // 진행 중 화면용 공정 퍼센트 (누적 + 현재 작업 진행분 반영)
      const inProgDone = ps.inProgress?.doneQty || 0;
      const curRunningDone = Math.round((p / 100) * j.inputQty);
      const virtualProd = ps.prodQty + inProgDone + curRunningDone;
      ps.progress = Math.max(0, Math.min(100, Math.floor((virtualProd / Math.max(ord.targetQty, 1)) * 100)));

      if (p >= 100) {
        // 작업 한 사이클 끝 → 공정 누적 반영
        const canAdd = Math.max(ord.targetQty - ps.prodQty, 0);
        const realAdd = Math.min(j.inputQty, canAdd);
        ps.prodQty += realAdd;

        if (ps.inProgress) {
          ps.inProgress.doneQty = Math.min(ps.inProgress.inputQty, (ps.inProgress.doneQty || 0) + j.inputQty);
          // inProgress가 입력량을 다 채웠다면 비우기
          if (ps.inProgress.doneQty >= ps.inProgress.inputQty) {
            ps.inProgress = null;
          }
        }

        // 공정 진행률 재계산
        _recalcProcProgress(ord, j.process);
        // 전체 기생산량 재계산
        _recalcOrderProduced(ord);

        // 상태 업데이트
        ps.status = ps.progress >= 100 ? 'DONE' : 'IDLE';
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
