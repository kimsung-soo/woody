<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard>
    <div class="wizard-head">
      <div class="steps">
        <div class="step" :class="{ active: step === 1, done: step > 1 }">1. 지시/작업자/공정</div>
        <div class="sep"></div>
        <div class="step" :class="{ active: step === 2, done: step > 2 }">2. 설비선택</div>
        <div class="sep"></div>
        <div class="step" :class="{ active: step === 3 }">3. 진행제어</div>
      </div>
      <div class="actions">
        <v-btn variant="tonal" :disabled="step === 1" @click="prevStep">이전</v-btn>
        <v-btn color="primary" :disabled="!canNext" @click="nextStep">{{ step < 3 ? '다음' : '완료' }}</v-btn>
      </div>
    </div>

    <v-window v-model="step" class="mt-2">
      <!-- STEP 1 -->
      <v-window-item :value="1">
        <v-row>
          <v-col cols="12" md="7">
            <v-card variant="outlined">
              <v-card-title>지시목록</v-card-title>
              <v-data-table :headers="orderHeaders" :items="orders" item-key="id" density="compact" :items-per-page="6" class="no-hover">
                <template v-slot:[`item.progressCol`]="{ item }">
                  <div class="prog-wrap">
                    <v-progress-linear :model-value="orderProgress(item)" height="10" />
                    <span class="prog-text">{{ orderProgress(item) }}%</span>
                  </div>
                </template>

                <template v-slot:[`item.stateCol`]="{ item }">
                  <v-chip size="small" :color="stateColor(overallState(item))" variant="tonal">
                    {{ overallState(item) }}
                  </v-chip>
                </template>

                <template v-slot:[`item.pick`]="{ item }">
                  <v-btn size="small" variant="tonal" @click="pickOrder(item)">선택</v-btn>
                </template>
              </v-data-table>
            </v-card>
          </v-col>

          <v-col cols="12" md="5">
            <v-card variant="outlined" class="h-full">
              <v-card-title>작업자 & 공정 선택</v-card-title>
              <v-card-text>
                <div class="picked-box" v-if="pickedOrder">
                  <div>
                    지시번호: <b>{{ pickedOrder.issueNumber }}</b>
                  </div>
                  <div>제품: {{ pickedOrder.productName }} ({{ pickedOrder.productType }})</div>
                  <div>
                    목표/기생산/미생산: <b>{{ pickedOrder.targetQty }}</b> / {{ pickedOrder.producedQty }} / {{ remainingQty }}
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
        </v-row>
      </v-window-item>

      <!-- STEP 2 -->
      <v-window-item :value="2">
        <v-card variant="outlined">
          <v-card-title
            >설비 선택 <small class="muted">— {{ pickedProcessName }}</small></v-card-title
          >
          <v-card-text>
            <div class="grid-btns">
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
      </v-window-item>

      <!-- STEP 3 -->
      <v-window-item :value="3">
        <v-row>
          <v-col cols="12" md="7">
            <v-card variant="outlined" class="pa-4">
              <v-row>
                <v-col cols="12" md="6"
                  ><v-text-field label="지시번호" :model-value="pickedOrder?.issueNumber" readonly density="compact" variant="outlined"
                /></v-col>
                <v-col cols="12" md="6"
                  ><v-text-field label="공정" :model-value="pickedProcessName" readonly density="compact" variant="outlined"
                /></v-col>
                <v-col cols="12" md="6"
                  ><v-text-field label="목표수량" :model-value="pickedOrder?.targetQty" readonly density="compact" variant="outlined"
                /></v-col>
                <v-col cols="12" md="6"
                  ><v-text-field label="기생산량" :model-value="pickedOrder?.producedQty" readonly density="compact" variant="outlined"
                /></v-col>
                <v-col cols="12" md="6"
                  ><v-text-field label="미생산량" :model-value="remainingQty" readonly density="compact" variant="outlined"
                /></v-col>
                <v-col cols="12" md="6"
                  ><v-text-field label="작업자" :model-value="pickedWorker?.name" readonly density="compact" variant="outlined"
                /></v-col>

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
import { ref, computed } from 'vue';
import { useProcessSimStore, PROCESS_LIST } from '@/stores/useProcessSimStore';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const store = useProcessSimStore();

const page = ref({ title: '공정 진행관리' });
const breadcrumbs = ref([
  { title: '생산', disabled: true, href: '#' },
  { title: '공정 진행관리', disabled: false, href: '#' }
]);

const step = ref(1);
function prevStep() {
  if (step.value > 1) step.value--;
}
function nextStep() {
  if (step.value < 3) step.value++;
  else alert('완료(데모)');
}

const orders = computed(() => store.orders);
const workers = computed(() => store.workers);

const pickedOrder = ref(null);
const pickedWorker = ref(null);
const pickedProcess = ref(null);
const pickedEquipIds = ref([]);

const orderHeaders = [
  { title: '지시번호', value: 'issueNumber' },
  { title: '제품명', value: 'productName' },
  { title: '유형', value: 'productType' },
  { title: '상태', value: 'stateCol', sortable: false },
  { title: '진행률', value: 'progressCol', sortable: false },
  { title: '선택', value: 'pick', sortable: false }
];
function overallState(o) {
  const list = Object.values(o.processes || {});
  if (!list.length) return 'N/A';
  if (list.some((p) => p.status === 'RUN')) return '생산중';
  if (list.every((p) => p.status === 'DONE')) return '생산완료';
  return '생산대기';
}
function stateColor(s) {
  return s === '생산중' ? 'primary' : s === '생산완료' ? 'success' : 'grey';
}
function orderProgress(o) {
  const list = Object.values(o.processes || {});
  if (!list.length) return 0;
  return Math.round(list.reduce((a, b) => a + (b.progress || 0), 0) / list.length);
}
function pickOrder(o) {
  pickedOrder.value = o;
  pickedWorker.value = null;
  pickedProcess.value = null;
  pickedEquipIds.value = [];
}

const processesForProduct = computed(() => {
  if (!pickedOrder.value) return [];
  const isSemi = pickedOrder.value.productType === '반제품';
  return PROCESS_LIST.filter((p) => !(isSemi && p.code === 'ASM'));
});
const pickedProcessName = computed(() => PROCESS_LIST.find((p) => p.code === pickedProcess.value)?.name || '-');

const equipmentsByProcess = computed(() => store.equipments.filter((e) => e.process === pickedProcess.value));
function toggleEquip(id) {
  const i = pickedEquipIds.value.indexOf(id);
  if (i >= 0) pickedEquipIds.value.splice(i, 1);
  else pickedEquipIds.value.push(id);
}
const pickedEquipments = computed(() => store.equipments.filter((e) => pickedEquipIds.value.includes(e.id)));

const remainingQty = computed(() => (pickedOrder.value ? pickedOrder.value.remainingQty : 0));
const inputQty = ref(0);
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

const canNext = computed(() => {
  if (step.value === 1) return !!(pickedOrder.value && pickedWorker.value && pickedProcess.value);
  if (step.value === 2) return pickedEquipIds.value.length > 0;
  return true;
});

function doStart() {
  if (!pickedOrder.value || !pickedProcess.value || !pickedWorker.value) return;
  if (inputQty.value <= 0) return alert('투입량을 입력하세요.');
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
  if (pickedOrder.value && pickedProcess.value) store.pauseJob(pickedOrder.value.id, pickedProcess.value);
}
function doFinish() {
  if (pickedOrder.value && pickedProcess.value) store.finishJob(pickedOrder.value.id, pickedProcess.value);
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
</style>
