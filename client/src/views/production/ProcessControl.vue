<!-- src/views/production/ProcessControl.vue -->
<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard>
    <!-- 상단 단계 표시 (2단계로 단순화) -->
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
      <!-- STEP 1 : 지시목록(상단 전체 폭) + 하단(작업자/공정, 설비) -->
      <v-window-item :value="1">
        <v-row>
          <!-- 지시목록: 전체 폭 (길게) -->
          <v-col cols="12">
            <v-card variant="outlined">
              <v-card-title>지시목록</v-card-title>
              <v-data-table class="no-hover" density="compact" :headers="orderHeaders" :items="orders" item-key="id" :items-per-page="8">
                <!-- 진행률 -->
                <template v-slot:[`item.progressCol`]="{ item }">
                  <div class="prog-wrap">
                    <v-progress-linear :model-value="orderProgress(item?.raw ?? item)" height="10" />
                    <span class="prog-text">{{ orderProgress(item?.raw ?? item) }}%</span>
                  </div>
                </template>

                <!-- 상태 -->
                <template v-slot:[`item.stateCol`]="{ item }">
                  <v-chip size="small" :color="stateColor(overallState(item?.raw ?? item))" variant="tonal">
                    {{ overallState(item?.raw ?? item) }}
                  </v-chip>
                </template>

                <!-- 선택 버튼 -->
                <template v-slot:[`item.pick`]="{ item }">
                  <v-btn size="small" variant="tonal" @click="pickOrder(item?.raw ?? item)"> 선택 </v-btn>
                </template>
              </v-data-table>
            </v-card>
          </v-col>

          <!-- 아래: 좌 = 작업자/공정, 우 = 설비 -->
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
                      @click="pickedProcess = p.code"
                    >
                      {{ p.name }}
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card variant="outlined" class="h-full">
              <v-card-title>
                설비 선택
                <small class="muted"> — {{ pickedProcessName }}</small>
              </v-card-title>
              <v-card-text>
                <div v-if="!pickedProcess" class="muted">공정을 먼저 선택하세요.</div>
                <div v-else class="grid-btns">
                  <v-btn
                    v-for="e in equipmentsByProcess"
                    :key="e.id"
                    class="grid-btn"
                    :color="pickedEquipIds.includes(e.id) ? 'primary' : undefined"
                    @click="toggleEquip(e.id)"
                  >
                    <div class="bold">{{ e.name }}</div>
                    <div class="muted">{{ e.code }}</div>
                  </v-btn>
                </div>
                <v-alert type="info" variant="tonal" class="mt-3">여러 대 선택 가능</v-alert>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- STEP 2 : 진행 제어 (기존 3단계 내용) -->
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

                <!-- 자동 시간 기록 -->
                <v-col cols="12" md="6">
                  <v-text-field label="시작일시" :model-value="ctrlTime.startAt" readonly density="compact" variant="outlined" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field label="종료일시" :model-value="ctrlTime.endAt" readonly density="compact" variant="outlined" />
                </v-col>

                <!-- 키오스크 키패드 -->
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
                    <div class="muted small mt-1">투입량은 미생산량({{ remainingQty }})을 초과할 수 없음</div>
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
              <ul class="equip-list">
                <li v-for="e in pickedEquipments" :key="e.id">{{ e.name }} ({{ e.code }})</li>
              </ul>
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
import { useProcessSimStore, PROCESS_LIST } from '@/stores/useProcessSimStore';

const store = useProcessSimStore();

/* 헤더 */
const page = ref({ title: '공정 진행관리' });
const breadcrumbs = ref([
  { title: '생산', disabled: true, href: '#' },
  { title: '공정 진행관리', disabled: false, href: '#' }
]);

/* 단계 (2단계) */
const step = ref(1);
function prevStep() {
  if (step.value > 1) step.value--;
}
function nextStep() {
  if (step.value < 2) step.value++;
  else alert('완료(데모)');
}

/* 리스트/선택 */
const orders = computed(() => store.orders ?? []);
const workers = computed(() => store.workers);

const pickedOrder = ref(null);
const pickedWorker = ref(null);
const pickedProcess = ref(null);
const pickedEquipIds = ref([]);

/* 테이블 헤더 */
const orderHeaders = [
  { title: '지시번호', value: 'issueNumber' },
  { title: '제품명', value: 'productName' },
  { title: '유형', value: 'productType' },
  { title: '상태', value: 'stateCol', sortable: false },
  { title: '진행률', value: 'progressCol', sortable: false },
  { title: '선택', value: 'pick', sortable: false }
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
function stateColor(s) {
  return s === '생산중' ? 'primary' : s === '생산완료' ? 'success' : 'grey';
}
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
  pickedEquipIds.value = [];
}

/* 제품 유형에 따른 공정 목록 */
const processesForProduct = computed(() => {
  if (!pickedOrder.value) return [];
  const isSemi = pickedOrder.value.productType === '반제품';
  return PROCESS_LIST.filter((p) => !(isSemi && p.code === 'ASM'));
});
const pickedProcessName = computed(() => PROCESS_LIST.find((p) => p.code === pickedProcess.value)?.name || '-');

/* 설비 */
const equipmentsByProcess = computed(() => store.equipments.filter((e) => e.process === pickedProcess.value));
function toggleEquip(id) {
  const i = pickedEquipIds.value.indexOf(id);
  if (i >= 0) pickedEquipIds.value.splice(i, 1);
  else pickedEquipIds.value.push(id);
}
const pickedEquipments = computed(() => store.equipments.filter((e) => pickedEquipIds.value.includes(e.id)));

/* ------- 전체 기생산/미생산 로직 ------- */
const requiredProcessCodes = computed(() => {
  if (!pickedOrder.value) return [];
  const isSemi = pickedOrder.value.productType === '반제품';
  return PROCESS_LIST.filter((p) => !(isSemi && p.code === 'ASM')).map((p) => p.code);
});
function procProduced(order, code) {
  return order?.processes?.[code]?.prodQty ?? 0;
}
const producedOverall = computed(() => {
  if (!pickedOrder.value) return 0;
  const codes = requiredProcessCodes.value;
  if (!codes.length) return 0;
  const list = codes.map((c) => procProduced(pickedOrder.value, c));
  const minVal = Math.min(...list);
  return Math.max(0, Math.min(minVal, pickedOrder.value.targetQty));
});
const remainingQty = computed(() => {
  if (!pickedOrder.value) return 0;
  return Math.max(0, pickedOrder.value.targetQty - producedOverall.value);
});

/* ------- 키패드/시간 기록 ------- */
const inputQty = ref(0);
const ctrlTime = ref({ startAt: '', endAt: '' });
watch(pickedProcess, () => {
  inputQty.value = 0;
  ctrlTime.value = { startAt: '', endAt: '' };
});

function pushDigit(n) {
  const next = Number(String(inputQty.value) + String(n));
  inputQty.value = Math.min(next, remainingQty.value);
}
function clearQty() {
  inputQty.value = 0;
}
function applyQty() {
  inputQty.value = Math.min(inputQty.value, remainingQty.value);
}

const currentProcProgress = computed(() => {
  if (!pickedOrder.value || !pickedProcess.value) return 0;
  return pickedOrder.value.processes[pickedProcess.value]?.progress || 0;
});

/* 다음 버튼 가용성 (1단계에서 모든 선택 필요) */
const canNext = computed(() => {
  if (step.value === 1) return !!(pickedOrder.value && pickedWorker.value && pickedProcess.value && pickedEquipIds.value.length > 0);
  return true;
});

/* 시간 포맷(yyyy-MM-ddTHH:mm) */
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
  if (inputQty.value <= 0) return alert('투입량을 입력하세요.');

  ctrlTime.value.startAt = nowISO();
  ctrlTime.value.endAt = '';

  const res = store.startJob({
    orderId: pickedOrder.value.id,
    process: pickedProcess.value,
    workerId: pickedWorker.value.id,
    equipIds: pickedEquipIds.value.slice(),
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

.equip-list {
  margin: 0;
  padding-left: 18px;
}

.text-right {
  text-align: right;
}
</style>
