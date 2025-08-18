<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard>
    <div class="wizard-head">
      <div class="steps">
        <div class="step" :class="{ active: step === 1, done: step > 1 }">1. 지시/작업자/공정/설비</div>
        <div class="sep"></div>
        <div class="step" :class="{ active: step === 2 }">2. 진행제어</div>
      </div>
      <div class="actions">
        <v-btn variant="tonal" :disabled="step === 1" @click="prevStep">이전</v-btn>
        <v-btn color="primary" :disabled="!canNext" @click="nextStep">{{ step < 2 ? '다음' : '완료' }}</v-btn>
      </div>
    </div>

    <v-window v-model="step" class="mt-2">
      <!-- STEP 1 -->
      <v-window-item :value="1">
        <v-row>
          <v-col cols="12">
            <v-card variant="outlined">
              <v-card-title>지시목록</v-card-title>
              <v-data-table class="no-hover" density="compact" :headers="orderHeaders" :items="orders" item-key="id" :items-per-page="8">
                <template v-slot:[`item.progressCol`]="{ item }">
                  <div class="prog-wrap">
                    <v-progress-linear :model-value="orderProgress(r(item))" height="10" />
                    <span class="prog-text">{{ orderProgress(r(item)) }}%</span>
                  </div>
                </template>

                <template v-slot:[`item.stateCol`]="{ item }">
                  <v-chip size="small" :color="stateColor(overallState(r(item)))" variant="tonal">
                    {{ overallState(r(item)) }}
                  </v-chip>
                </template>

                <template v-slot:[`item.pick`]="{ item }">
                  <v-btn size="small" variant="tonal" @click="pickOrder(r(item))">선택</v-btn>
                </template>
              </v-data-table>
            </v-card>
          </v-col>

          <!-- 좌: 작업자/공정 -->
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="h-full">
              <v-card-title>작업자 & 공정 선택</v-card-title>
              <v-card-text>
                <div class="picked-box" v-if="pickedOrder">
                  <div>
                    지시번호: <b>{{ pickedOrder.issueNumber }}</b>
                  </div>
                  <div>제품: {{ pickedOrder.productName }} ({{ pickedOrder.productType }})</div>
                  <div>
                    목표/기생산(전체)/미생산(전체):
                    <b>{{ pickedOrder.targetQty }}</b> / {{ producedOverall }} / {{ remainingQty }}
                  </div>
                </div>

                <div v-if="pickedOrder" class="mt-3">
                  <div class="label mb-1">공정별 생산량</div>
                  <v-data-table :headers="procHeaders" :items="procRows" density="compact" class="no-hover" hide-default-footer>
                    <template v-slot:[`item.progress`]="{ item }">
                      <div class="prog-wrap">
                        <v-progress-linear :model-value="item.progress" height="8" />
                        <span class="prog-text">{{ item.progress }}%</span>
                      </div>
                    </template>
                    <template v-slot:[`item.state`]="{ item }">
                      <v-chip size="x-small" :color="stateChipColor(item.state)" variant="tonal">
                        {{ item.stateLabel }}
                      </v-chip>
                    </template>
                  </v-data-table>
                </div>

                <div class="mt-4">
                  <div class="label">작업자 선택</div>
                  <div class="grid-btns">
                    <v-btn
                      v-for="w in workers"
                      :key="w.id"
                      class="grid-btn"
                      :color="pickedWorker?.id === w.id ? 'primary' : undefined"
                      @click="pickedWorker = w"
                    >
                      <div class="bold">{{ w.name }}</div>
                      <div class="muted">{{ w.id }}</div>
                    </v-btn>
                  </div>
                </div>

                <div class="mt-4">
                  <div class="label">공정 선택</div>
                  <div class="grid-btns">
                    <v-btn
                      v-for="p in processesForProduct"
                      :key="p.code"
                      class="grid-btn"
                      :color="pickedProcess === p.code ? 'primary' : undefined"
                      @click="tryPickProcess(p.code)"
                    >
                      {{ p.name }}
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 우: 설비 -->
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="h-full">
              <v-card-title>
                설비 선택
                <small class="muted"> — {{ pickedProcessName }}</small>
              </v-card-title>
              <v-card-text>
                <div v-if="!pickedProcess" class="muted">공정을 먼저 선택하세요.</div>

                <template v-else>
                  <v-data-table :headers="eqHeaders" :items="eqRows" density="compact" item-key="id" :items-per-page="5" class="no-hover">
                    <template v-slot:[`item.status`]="{ item }">
                      <v-chip size="small" :color="statusColor(r(item).status)" variant="tonal">
                        {{ statusLabel(r(item).status) }}
                      </v-chip>
                    </template>

                    <template v-slot:[`item.pick`]="{ item }">
                      <v-btn
                        size="small"
                        :variant="pickedEquipId === r(item).id ? 'elevated' : 'tonal'"
                        :color="buttonColor(r(item))"
                        :disabled="!canPickThis(r(item))"
                        @click="pickEquip(r(item))"
                      >
                        {{ pickedEquipId === r(item).id ? '선택됨' : isResume && isResumeEquip(r(item).id) ? '재개' : '선택' }}
                      </v-btn>
                    </template>
                  </v-data-table>

                  <v-alert type="info" variant="tonal" class="mt-3"> 한 공정당 <b>1대</b>만 선택 가능합니다. </v-alert>
                </template>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- STEP 2 -->
      <v-window-item :value="2">
        <v-row>
          <v-col cols="12" md="7">
            <v-card variant="outlined" class="pa-4">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field label="지시번호" :model-value="pickedOrder?.issueNumber" readonly density="compact" variant="outlined" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field label="공정" :model-value="pickedProcessName" readonly density="compact" variant="outlined" />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field label="목표수량" :model-value="pickedOrder?.targetQty" readonly density="compact" variant="outlined" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field label="기생산량(전체)" :model-value="producedOverall" readonly density="compact" variant="outlined" />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field label="미생산량(전체)" :model-value="remainingQty" readonly density="compact" variant="outlined" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field label="작업자" :model-value="pickedWorker?.name" readonly density="compact" variant="outlined" />
                </v-col>

                <!-- 해당 공정 기준 -->
                <v-col cols="12" md="6">
                  <v-text-field label="해당 공정 생산량" :model-value="currentProcProduced" readonly density="compact" variant="outlined" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    label="해당 공정 미생산량"
                    :model-value="currentProcRemaining"
                    readonly
                    density="compact"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field label="시작일시" :model-value="ctrlTime.startAt" readonly density="compact" variant="outlined" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field label="종료일시" :model-value="ctrlTime.endAt" readonly density="compact" variant="outlined" />
                </v-col>

                <v-col cols="12">
                  <div class="label mb-1">투입량</div>
                  <div class="keypad">
                    <div class="keypad-screen">{{ inputQty }}</div>
                    <div class="keys">
                      <button v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9]" :key="`n${n}`" @click="pushDigit(n)">{{ n }}</button>
                      <button @click="clearQty">C</button>
                      <button @click="pushDigit(0)">0</button>
                      <button @click="applyQty">✔</button>
                    </div>
                    <div class="muted small mt-1">투입량은 허용 상한({{ allowedInputCap }})을 초과할 수 없음</div>
                  </div>
                </v-col>
              </v-row>

              <div class="text-right mt-2">
                <v-btn color="primary" class="mr-2" @click="doStart">작업시작</v-btn>
                <v-btn color="warning" class="mr-2" @click="doPause">일시정지</v-btn>
                <v-btn color="error" @click="doFinish">작업종료</v-btn>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="5">
            <v-card variant="outlined" class="pa-4">
              <div class="label">선택 설비</div>
              <div v-if="pickedEquip">
                {{ pickedEquip.name }} ({{ pickedEquip.code }})
                <v-chip size="x-small" class="ml-2" :color="statusColor(pickedEquip.status)" variant="tonal">
                  {{ statusLabel(pickedEquip.status) }}
                </v-chip>
              </div>
              <div v-else class="muted">선택된 설비 없음</div>

              <v-divider class="my-3" />
              <div class="label">현재 공정 진행률</div>
              <v-progress-linear :model-value="currentProcProgress" height="12" class="mt-2" />
              <div class="muted mt-1">{{ currentProcProgress }}%</div>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>
  </UiParentCard>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useProcessSimStore, PROCESS_LIST, EQ } from '@/stores/useProcessSimStore';

const store = useProcessSimStore();

/* 헤더 */
const page = ref({ title: '공정 진행관리' });
const breadcrumbs = ref([
  { title: '생산', disabled: true, href: '#' },
  { title: '공정 진행관리', disabled: false, href: '#' }
]);

/* 단계 */
const step = ref(1);
const prevStep = () => {
  if (step.value > 1) step.value--;
};
const nextStep = () => {
  if (step.value < 2) step.value++;
  else alert('완료(데모)');
};

/* 리스트/선택 */
const orders = computed(() => store.orders ?? []);
const workers = computed(() => store.workers);

const pickedOrder = ref(null);
const pickedWorker = ref(null);
const pickedProcess = ref(null);
const pickedEquipId = ref(null);

// v-data-table item -> raw
const r = (it) => (it && typeof it === 'object' && 'raw' in it ? it.raw : it);

/* 컬럼 */
const orderHeaders = [
  { title: '지시번호', value: 'issueNumber' },
  { title: '제품명', value: 'productName' },
  { title: '유형', value: 'productType' },
  { title: '상태', value: 'stateCol', sortable: false },
  { title: '진행률', value: 'progressCol', sortable: false },
  { title: '선택', value: 'pick', sortable: false }
];

const eqHeaders = [
  { title: 'Id', value: 'id', width: 90 },
  { title: 'Name', value: 'name' },
  { title: 'Code', value: 'code' },
  { title: 'Status', value: 'status', sortable: false },
  { title: '선택', value: 'pick', sortable: false, align: 'end' }
];

/* 상태/진행률 */
function overallState(o) {
  if (!o || !o.processes) return 'N/A';
  const list = Object.values(o.processes);
  if (!list.length) return 'N/A';
  if (list.some((p) => p?.status === 'RUN')) return '생산중';
  if (list.every((p) => p?.status === 'DONE')) return '생산완료';
  return '생산대기';
}
const stateColor = (s) => (s === '생산중' ? 'primary' : s === '생산완료' ? 'success' : 'grey');
function orderProgress(o) {
  if (!o || !o.processes) return 0;
  const list = Object.values(o.processes);
  if (!list.length) return 0;
  return Math.round(list.reduce((a, b) => a + (b?.progress || 0), 0) / list.length);
}
function pickOrder(o) {
  pickedOrder.value = o;
  pickedWorker.value = null;
  pickedProcess.value = null;
  pickedEquipId.value = null;
}

/* 공정/설비 */
const processesForProduct = computed(() => {
  if (!pickedOrder.value) return [];
  const isSemi = pickedOrder.value.productType === '반제품';
  return PROCESS_LIST.filter((p) => !(isSemi && p.code === 'ASM'));
});
const pickedProcessName = computed(() => PROCESS_LIST.find((p) => p.code === pickedProcess.value)?.name || '-');

const equipmentsByProcess = computed(() => store.equipments.filter((e) => e.process === pickedProcess.value));
const eqRows = computed(() => equipmentsByProcess.value.map((e) => ({ id: e.id, name: e.name, code: e.code, status: e.status })));

const pickedEquip = computed(() => (!pickedEquipId.value ? null : store.equipments.find((e) => e.id === pickedEquipId.value) || null));

function statusLabel(s) {
  if (s === EQ.AVAILABLE) return '사용가능';
  if (s === EQ.IN_USE) return '사용중';
  if (s === EQ.MAINT) return '점검중';
  return s || '-';
}
function statusColor(s) {
  return s === EQ.AVAILABLE ? 'success' : s === EQ.IN_USE ? 'warning' : s === EQ.MAINT ? 'grey' : 'grey';
}

/* ===== 배치(투입량) 재진입 제어 ===== */
function remainBatchQty(ps) {
  if (!ps || !ps.inProgress) return 0;
  const input = ps.inProgress.inputQty || 0;
  const done = ps.inProgress.doneQty || 0;
  return Math.max(input - done, 0);
}
const currentPs = computed(() => pickedOrder.value?.processes?.[pickedProcess.value]);
const isResume = computed(() => {
  const ps = currentPs.value;
  return ps?.status === 'PAUSE' && ps?.inProgress && remainBatchQty(ps) > 0;
});
const isResumeEquip = (id) => (currentPs.value?.equipIds || []).includes(id);

function canPickThis(row) {
  if (row.status === EQ.AVAILABLE) return true;
  if (isResume.value && isResumeEquip(row.id)) return true;
  return false;
}
function buttonColor(row) {
  if (!canPickThis(row)) return 'grey';
  if (pickedEquipId.value === row.id) return 'primary';
  if (isResume.value && isResumeEquip(row.id)) return 'warning';
  return undefined;
}
function pickEquip(row) {
  if (!canPickThis(row)) return alert('이 설비는 현재 선택할 수 없습니다. (상태: ' + statusLabel(row.status) + ')');
  pickedEquipId.value = pickedEquipId.value === row.id ? null : row.id;
}

/* ===== 공정 순서 강제 ===== */
const orderedProcessCodes = computed(() => {
  if (!pickedOrder.value) return [];
  const isSemi = pickedOrder.value.productType === '반제품';
  return PROCESS_LIST.filter((p) => !(isSemi && p.code === 'ASM')).map((p) => p.code);
});
function prevIncompleteList(targetCode) {
  if (!pickedOrder.value) return [];
  const codes = orderedProcessCodes.value;
  const idx = codes.indexOf(targetCode);
  if (idx <= 0) return [];
  const prevs = codes.slice(0, idx);
  return prevs.filter((c) => pickedOrder.value.processes?.[c]?.status !== 'DONE');
}
function processName(code) {
  return PROCESS_LIST.find((p) => p.code === code)?.name || code;
}

function tryPickProcess(nextCode) {
  // 순서 체크
  const incompletes = prevIncompleteList(nextCode);
  if (incompletes.length) {
    const names = incompletes.map(processName).join(', ');
    alert(`이전 공정이 완료되지 않았습니다.\n먼저 완료해야 하는 공정: ${names}`);
    return;
  }

  // 배치/재개 가드
  const ps = currentPs.value;
  if (ps?.status === 'RUN') return alert('현재 공정에서 작업이 진행 중입니다. 일시정지 후 종료까지 하거나 배치 완료 후 이동하세요.');
  if (ps?.status === 'PAUSE' && remainBatchQty(ps) > 0)
    return alert('일시정지 중인 배치가 완료되지 않았습니다. 재개 후 완료(작업종료)까지 진행하거나 배치 완료 후 이동하세요.');

  pickedProcess.value = nextCode;
}

/* 공정 변경 시 초기화 + 재개 설비 자동 선택 */
watch(pickedProcess, () => {
  inputQty.value = 0;
  ctrlTime.value = { startAt: '', endAt: '' };
  pickedEquipId.value = null;
  const prevId = currentPs.value?.equipIds?.[0];
  if (prevId) pickedEquipId.value = prevId;
});

/* 기/미생산 집계 */
const requiredProcessCodes = computed(() => {
  if (!pickedOrder.value) return [];
  const isSemi = pickedOrder.value.productType === '반제품';
  return PROCESS_LIST.filter((p) => !(isSemi && p.code === 'ASM')).map((p) => p.code);
});
const procProduced = (order, code) => order?.processes?.[code]?.prodQty ?? 0;
const producedOverall = computed(() => {
  if (!pickedOrder.value) return 0;
  const codes = requiredProcessCodes.value;
  if (!codes.length) return 0;
  const list = codes.map((c) => procProduced(pickedOrder.value, c));
  const minVal = Math.min(...list);
  return Math.max(0, Math.min(minVal, pickedOrder.value.targetQty));
});
const remainingQty = computed(() => (!pickedOrder.value ? 0 : Math.max(0, pickedOrder.value.targetQty - producedOverall.value)));

/* 현재 선택 공정 기준 */
const psNow = computed(() => pickedOrder.value?.processes?.[pickedProcess.value] || null);
const currentProcProduced = computed(() => psNow.value?.prodQty ?? 0);
const currentProcRemaining = computed(() =>
  !pickedOrder.value ? 0 : Math.max(0, pickedOrder.value.targetQty - (psNow.value?.prodQty ?? 0))
);
const allowedInputCap = computed(() => Math.min(remainingQty.value, currentProcRemaining.value));

/* 공정별 생산량 테이블 */
const procHeaders = [
  { title: '공정', value: 'name' },
  { title: '생산량', value: 'qty', align: 'end' },
  { title: '진행률', value: 'progress', sortable: false, align: 'end' },
  { title: '상태', value: 'state', sortable: false, align: 'end' }
];
const procRows = computed(() => {
  if (!pickedOrder.value) return [];
  const isSemi = pickedOrder.value.productType === '반제품';
  const codes = PROCESS_LIST.filter((p) => !(isSemi && p.code === 'ASM')).map((p) => p.code);
  return codes.map((code) => {
    const pinfo = PROCESS_LIST.find((p) => p.code === code);
    const st = pickedOrder.value.processes[code];
    const qty = st?.prodQty ?? 0;
    const prog = st?.progress ?? 0;
    return {
      code,
      name: pinfo?.name || code,
      qty: `${qty} / ${pickedOrder.value.targetQty}`,
      progress: prog,
      state: st?.status || 'WAIT',
      stateLabel:
        st?.status === 'RUN'
          ? '생산중'
          : st?.status === 'PAUSE'
            ? '일시정지'
            : st?.status === 'DONE'
              ? '완료'
              : st?.status === 'IDLE'
                ? '대기'
                : '준비'
    };
  });
});
function stateChipColor(state) {
  if (state === 'RUN') return 'primary';
  if (state === 'PAUSE') return 'warning';
  if (state === 'DONE') return 'success';
  return 'grey';
}

/* 키패드/시간 */
const inputQty = ref(0);
const ctrlTime = ref({ startAt: '', endAt: '' });
function pushDigit(n) {
  const next = Number(String(inputQty.value) + String(n));
  inputQty.value = Math.min(next, allowedInputCap.value);
}
const clearQty = () => (inputQty.value = 0);
const applyQty = () => (inputQty.value = Math.min(inputQty.value, allowedInputCap.value));

const currentProcProgress = computed(() =>
  !pickedOrder.value || !pickedProcess.value ? 0 : pickedOrder.value.processes[pickedProcess.value]?.progress || 0
);

/* 다음 버튼 가용성 */
const canNext = computed(() =>
  step.value === 1 ? !!(pickedOrder.value && pickedWorker.value && pickedProcess.value && pickedEquipId.value) : true
);

/* 시간 포맷 */
function nowISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

/* 제어 */
function doStart() {
  if (!pickedOrder.value || !pickedProcess.value || !pickedWorker.value) return;

  // 순서 강제: 이전 공정 완료 여부
  const incompletes = prevIncompleteList(pickedProcess.value);
  if (incompletes.length) {
    const names = incompletes.map(processName).join(', ');
    return alert(`이전 공정이 완료되지 않았습니다.\n먼저 완료해야 하는 공정: ${names}`);
  }

  if (!pickedEquipId.value) return alert('설비를 선택하세요.');

  // 신규 시작일 때만 투입량 필수
  const ps = currentPs.value;
  if (!(ps?.status === 'PAUSE' && ps?.inProgress)) {
    if (inputQty.value <= 0) return alert('투입량을 입력하세요.');
  }

  ctrlTime.value.startAt = nowISO();
  ctrlTime.value.endAt = '';

  const res = store.startJob({
    orderId: pickedOrder.value.id,
    process: pickedProcess.value,
    workerId: pickedWorker.value.id,
    equipIds: [pickedEquipId.value],
    inputQty: inputQty.value,
    durationSec: 30
  });
  if (!res.ok) alert(res.msg || '시작 실패');
}
function doPause() {
  if (!pickedOrder.value || !pickedProcess.value) return;
  ctrlTime.value.endAt = nowISO();
  store.pauseJob(pickedOrder.value.id, pickedProcess.value);
}
function doFinish() {
  if (!pickedOrder.value || !pickedProcess.value) return;
  ctrlTime.value.endAt = nowISO();
  store.finishJob(pickedOrder.value.id, pickedProcess.value);
}
</script>

<style scoped>
.wizard-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.steps {
  display: flex;
  align-items: center;
  gap: 8px;
}
.step {
  padding: 6px 10px;
  border-radius: 8px;
  background: #f4f4f5;
  font-weight: 600;
  font-size: 13px;
}
.step.active {
  background: #dbeafe;
  color: #1d4ed8;
}
.step.done {
  background: #dcfce7;
  color: #166534;
}
.sep {
  width: 16px;
  height: 2px;
  background: #e5e7eb;
  border-radius: 1px;
}
.actions {
  display: flex;
  gap: 8px;
}

.picked-box {
  padding: 10px;
  border-radius: 10px;
  background: #f8fafc;
}
.muted {
  color: #6b7280;
}
.bold {
  font-weight: 700;
}

.grid-btns {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.grid-btn {
  justify-content: flex-start;
  flex-direction: column;
  align-items: flex-start;
}

.h-full {
  height: 100%;
}
.no-hover .v-data-table__tr:hover {
  background: transparent;
}

.prog-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.prog-text {
  min-width: 38px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.keypad {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
}
.keypad-screen {
  height: 48px;
  background: #111;
  color: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 12px;
  font-size: 20px;
}
.keys {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;
}
.keys button {
  height: 44px;
  border: 0;
  border-radius: 8px;
  background: #f3f4f6;
  font-weight: 700;
}

.text-right {
  text-align: right;
}
.ml-2 {
  margin-left: 8px;
}
</style>
