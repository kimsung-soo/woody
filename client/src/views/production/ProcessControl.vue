<!-- src/views/production/ProcessControl.vue -->
<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard>
    <!-- 상단 진행 단계 -->
    <div class="wizard-head">
      <div class="steps">
        <div class="step" :class="{ active: step === 1, done: step > 1 }">1. 지시선택</div>
        <div class="sep"></div>
        <div class="step" :class="{ active: step === 2, done: step > 2 }">2. 설비선택</div>
        <div class="sep"></div>
        <div class="step" :class="{ active: step === 3 }">3. 진행제어</div>
      </div>
      <div class="actions">
        <v-btn variant="tonal" :disabled="step === 1" @click="prevStep">이전</v-btn>
        <v-btn color="primary" :disabled="!canNext" @click="nextStep">
          {{ step < 3 ? '다음' : '완료' }}
        </v-btn>
      </div>
    </div>

    <v-window v-model="step" class="mt-2">
      <!-- STEP 1 : 지시목록 -->
      <v-window-item :value="1">
        <section>
          <div class="section-head">
            <h5 class="pane-title">지시목록</h5>
            <div class="search-inline">
              <v-text-field
                v-model.trim="s1Keyword"
                placeholder="지시번호/제품코드/제품명/작성자"
                hide-details
                density="compact"
                variant="outlined"
                class="search-input"
                @keyup.enter="forceFit1"
              />
              <v-btn
                class="ml-2"
                @click="
                  () => {
                    s1Keyword = '';
                    forceFit1();
                  }
                "
                >초기화</v-btn
              >
              <v-btn color="primary" class="ml-2" @click="forceFit1">검색</v-btn>
            </div>
          </div>

          <div class="grid-wrap">
            <ag-grid-vue
              class="ag-theme-quartz ag-no-wrap"
              :rowData="s1Paged"
              :columnDefs="s1Cols"
              :pagination="true"
              :paginationPageSize="10"
              rowSelection="single"
              :suppressRowClickSelection="true"
              :rowMultiSelectWithClick="false"
              :getRowId="(row) => String(row.data.id)"
              @grid-ready="onGrid1Ready"
              @rowClicked="onOrderPick"
              @rowDoubleClicked="onOrderPick"
            />
          </div>

          <div class="mini-summary" v-if="picked.order">
            <v-alert type="info" variant="tonal" density="compact">
              선택된 지시: <b>{{ picked.order.issueNumber }}</b> / 제품: {{ picked.order.productName }} / 목표수량:
              {{ picked.order.targetQty }}
            </v-alert>
          </div>
        </section>
      </v-window-item>

      <!-- STEP 2 : 설비선택 -->
      <v-window-item :value="2">
        <section>
          <div class="section-head">
            <h5 class="pane-title">
              설비선택
              <small v-if="picked.order" class="muted">
                — (선택 공정: {{ chosenProcessName }} / 제품: {{ picked.order.productName }})
              </small>
            </h5>
            <div class="search-inline">
              <v-text-field
                v-model.trim="s2Keyword"
                placeholder="설비명/코드/유형/담당자"
                hide-details
                density="compact"
                variant="outlined"
                class="search-input"
                @keyup.enter="forceFit2"
              />
              <v-btn
                class="ml-2"
                @click="
                  () => {
                    s2Keyword = '';
                    forceFit2();
                  }
                "
                >초기화</v-btn
              >
              <v-btn color="primary" class="ml-2" @click="forceFit2">검색</v-btn>
            </div>
          </div>

          <div class="proc-pick">
            <v-radio-group v-model="s2Process" inline>
              <label class="v-label mr-4">공정 선택</label>
              <v-radio v-for="p in processes" :key="p.code" :label="p.name" :value="p.code" />
            </v-radio-group>
          </div>

          <div class="grid-wrap">
            <ag-grid-vue
              class="ag-theme-quartz ag-no-wrap"
              :rowData="s2Paged"
              :columnDefs="s2Cols"
              :pagination="true"
              :paginationPageSize="8"
              rowSelection="multiple"
              :rowMultiSelectWithClick="true"
              :suppressRowClickSelection="true"
              :getRowId="(row) => String(row.data.id)"
              @grid-ready="onGrid2Ready"
              @selection-changed="onEquipSelectionChanged"
            />
          </div>

          <div class="mini-summary" v-if="picked.equipIds.length">
            <v-alert type="success" variant="tonal" density="compact">
              선택 설비: {{ picked.equipIds.length }}대 ({{ picked.equipIds.map(String).join(', ') }})
            </v-alert>
          </div>
        </section>
      </v-window-item>

      <!-- STEP 3 : 진행 제어 -->
      <v-window-item :value="3">
        <section>
          <div class="section-head">
            <h5 class="pane-title">공정 진행 제어</h5>
          </div>

          <v-row>
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="pa-4">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field label="지시번호" :model-value="picked.order?.issueNumber" readonly density="compact" variant="outlined" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field label="제품유형" :model-value="picked.order?.productType" readonly density="compact" variant="outlined" />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      label="투입자재"
                      :model-value="picked.order?.inputMaterial"
                      readonly
                      density="compact"
                      variant="outlined"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field label="제품코드" :model-value="picked.order?.productCode" readonly density="compact" variant="outlined" />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field label="작업자명" v-model="ctrl.worker" density="compact" variant="outlined" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      label="진행상태"
                      v-model="ctrl.status"
                      :items="statusOptions"
                      item-title="label"
                      item-value="value"
                      density="compact"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field label="시작일시" v-model="ctrl.startAt" type="datetime-local" density="compact" variant="outlined" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field label="종료일시" v-model="ctrl.endAt" type="datetime-local" density="compact" variant="outlined" />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field label="목표수량" :model-value="picked.order?.targetQty" readonly density="compact" variant="outlined" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      label="투입량"
                      v-model.number="ctrl.inputQty"
                      type="number"
                      min="0"
                      step="1"
                      density="compact"
                      variant="outlined"
                    />
                  </v-col>
                </v-row>

                <div class="text-right mt-2">
                  <v-btn color="primary" class="mr-2" @click="doStart">작업시작</v-btn>
                  <v-btn color="warning" class="mr-2" @click="doPause">일시정지</v-btn>
                  <v-btn color="error" @click="doFinish">작업종료</v-btn>
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card variant="outlined" class="pa-4">
                <div class="label">선택 설비</div>
                <ul class="equip-chips">
                  <li v-for="e in pickedEquipments" :key="e.id">{{ e.name }} ({{ e.code }})</li>
                </ul>
                <v-alert variant="tonal" type="info" class="mt-2">
                  선택된 설비와 연동하여 공정 로그를 남길 자리입니다. (API 연동 지점)
                </v-alert>
              </v-card>
            </v-col>
          </v-row>
        </section>
      </v-window-item>
    </v-window>
  </UiParentCard>
</template>

<script setup>
import { ref, shallowRef, computed, markRaw } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { AgGridVue } from 'ag-grid-vue3';

/* 페이지 헤더 */
const page = ref({ title: '공정 진행관리' });
const breadcrumbs = shallowRef([
  { title: '생산', disabled: true, href: '#' },
  { title: '공정 진행관리', disabled: false, href: '#' }
]);

/* 단계 제어 */
const step = ref(1);
function prevStep() {
  if (step.value > 1) step.value--;
}
function nextStep() {
  if (step.value < 3) step.value++;
  else alert('완료되었습니다. (데모)');
}

/* 공정 마스터 */
const processes = [
  { code: 'CUT', name: '재단공정' },
  { code: 'FAB', name: '가공공정' },
  { code: 'PAI', name: '도장공정' },
  { code: 'ASM', name: '조립공정' }
];

/* 더미 생성 */
function pad2(n) {
  return String(n).padStart(2, '0');
}
function makeOrders() {
  const products = [
    { code: 'P001', name: '블랙 데스크' },
    { code: 'P002', name: '화이트 데스크' },
    { code: 'P003', name: '라운드 테이블' }
  ];
  const contacts = ['이민호', '이민우', '김찬용', '이동현'];
  const mats = ['합판, 철재', '목재, 나사', '재공품'];
  return Array.from({ length: 24 }, (_, i) => {
    const p = products[i % products.length],
      c = contacts[i % contacts.length],
      m = mats[i % mats.length];
    const month = 6 + (i % 3),
      day = 1 + (i % 27);
    const r = {
      id: 2000 + i,
      issueNumber: `WO-2025${pad2(month)}${pad2(day)}-${3100 + i}`,
      orderDate: `2025-${pad2(month)}-${pad2(day)}`,
      contact: c,
      productCode: p.code,
      productName: p.name,
      dueDate: `2025-${pad2(month)}-${pad2(((day + 15) % 28) + 1)}`,
      targetQty: 40 + (i % 12) * 10,
      inputMaterial: m,
      productType: i % 5 === 0 ? '반제품' : '완제품'
    };
    return { ...r, _hay: (r.issueNumber + r.productCode + r.productName + r.contact).toLowerCase() };
  });
}
function makeEquipments() {
  const owners = ['최윤수', '김성수', '이동현', '김태완', '김리완'];
  const base = ['절단기', 'CNC', '샌딩기', '도장기', '프레스'];
  return Array.from({ length: 30 }, (_, i) => {
    const kind = base[i % base.length],
      code = `EQ${String(i + 1).padStart(3, '0')}`;
    const e = {
      id: 5000 + i,
      code,
      name: `${kind}-${i + 1}`,
      type: i % 2 === 0 ? '재단설비' : '가공설비',
      maker: ['A사', 'B사', 'C사'][i % 3],
      installAt: `202${2 + (i % 3)}-0${1 + (i % 3)}-1${i % 9}`,
      expireAt: `202${6 + (i % 3)}-0${2 + (i % 3)}-2${i % 9}`,
      manager: owners[i % owners.length],
      status: i % 7 === 0 ? '점검중' : '사용',
      process: processes[i % processes.length].code
    };
    return { ...e, _hay: (e.name + e.code + e.type + e.manager).toLowerCase() };
  });
}

/* 선택 상태 */
const picked = ref({ order: null, equipIds: [] });

/* STEP1 상태 (평탄화) */
let grid1;
const s1Keyword = ref('');
const s1List = shallowRef(makeOrders());
const s1Cols = markRaw([
  { headerName: '지시번호', field: 'issueNumber', flex: 1.4, minWidth: 160, cellClass: 'cell-ellipsis' },
  { headerName: '지시일자', field: 'orderDate', flex: 0.9, minWidth: 110, cellClass: 'cell-ellipsis' },
  { headerName: '작성자', field: 'contact', flex: 0.8, minWidth: 90, cellClass: 'cell-ellipsis' },
  { headerName: '제품코드', field: 'productCode', flex: 0.9, minWidth: 100, cellClass: 'cell-ellipsis' },
  { headerName: '제품명칭', field: 'productName', flex: 1.2, minWidth: 140, cellClass: 'cell-ellipsis' },
  { headerName: '목표수량', field: 'targetQty', width: 100, cellClass: 'ag-right-aligned-cell cell-ellipsis' },
  { headerName: '제품유형', field: 'productType', width: 100, cellClass: 'cell-ellipsis' }
]);
const s1Paged = computed(() => {
  const kw = s1Keyword.value.trim().toLowerCase();
  return kw ? s1List.value.filter((r) => r._hay.includes(kw)) : s1List.value;
});
function onGrid1Ready(e) {
  grid1 = e.api;
  grid1.sizeColumnsToFit();
}
function forceFit1() {
  grid1?.sizeColumnsToFit();
}
function onOrderPick(ev) {
  picked.value.order = ev.data;
}

/* STEP2 상태 (평탄화) */
let grid2;
const s2Process = ref('CUT');
const s2Keyword = ref('');
const s2List = shallowRef(makeEquipments());
const s2Cols = markRaw([
  { headerName: '선택', checkboxSelection: true, headerCheckboxSelection: true, width: 70 },
  { headerName: '설비코드', field: 'code', width: 120, cellClass: 'cell-ellipsis' },
  { headerName: '설비명', field: 'name', flex: 1.4, minWidth: 150, cellClass: 'cell-ellipsis' },
  { headerName: '설비유형', field: 'type', width: 120, cellClass: 'cell-ellipsis' },
  { headerName: '제조사', field: 'maker', width: 90, cellClass: 'cell-ellipsis' },
  { headerName: '설치일자', field: 'installAt', width: 120, cellClass: 'cell-ellipsis' },
  { headerName: '점검상태', field: 'status', width: 90, cellClass: 'cell-ellipsis' },
  { headerName: '담당자', field: 'manager', width: 90, cellClass: 'cell-ellipsis' }
]);
const s2Filtered = computed(() => {
  const kw = s2Keyword.value.trim().toLowerCase();
  const proc = s2Process.value;
  return s2List.value.filter((e) => e.process === proc && (!kw || e._hay.includes(kw)));
});
const s2Paged = computed(() => s2Filtered.value);
function onGrid2Ready(e) {
  grid2 = e.api;
  grid2.sizeColumnsToFit();
}
function forceFit2() {
  grid2?.sizeColumnsToFit();
}
function onEquipSelectionChanged() {
  const rows = grid2?.getSelectedRows?.() || [];
  picked.value.equipIds = rows.map((r) => r.id);
}
const chosenProcessName = computed(() => processes.find((p) => p.code === s2Process.value)?.name || '-');

/* 다음 버튼 사용 가능 조건 */
const canNext = computed(() => {
  if (step.value === 1) return !!picked.value.order;
  if (step.value === 2) return picked.value.equipIds.length > 0;
  return true;
});

/* STEP3 제어 폼 */
const ctrl = ref({ worker: '', status: 'RUN', startAt: '', endAt: '', inputQty: 0 });
const statusOptions = [
  { label: '진행중', value: 'RUN' },
  { label: '대기', value: 'WAIT' },
  { label: '정지', value: 'STOP' }
];
const pickedEquipments = computed(() => {
  const ids = new Set(picked.value.equipIds);
  return s2List.value.filter((e) => ids.has(e.id));
});
function doStart() {
  if (!ctrl.value.worker.trim()) return alert('작업자명을 입력하세요.');
  if (!ctrl.value.startAt) return alert('시작일시를 입력하세요.');
  alert('작업 시작 기록(데모).');
}
function doPause() {
  alert('일시정지 기록(데모).');
}
function doFinish() {
  if (!ctrl.value.endAt) return alert('종료일시를 입력하세요.');
  alert('작업 종료 기록(데모).');
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
  align-items: center;
  gap: 8px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.pane-title {
  margin: 0;
  font-weight: 600;
}
.search-inline {
  display: flex;
  align-items: center;
}
.search-input {
  width: 320px;
  max-width: 420px;
  min-width: 260px;
}

.grid-wrap {
  height: 460px;
}
.ag-theme-quartz {
  height: 100%;
}
.ag-no-wrap .ag-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cell-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ag-theme-quartz {
  --ag-font-size: 12px;
  --ag-grid-size: 4px;
}

.mini-summary {
  margin-top: 10px;
}
.proc-pick {
  margin: 6px 0 10px;
}
.equip-chips {
  margin: 0;
  padding-left: 16px;
}
.equip-chips li {
  margin: 2px 0;
}
.text-right {
  text-align: right;
}
.muted {
  color: #6b7280;
  font-weight: 500;
}
</style>
