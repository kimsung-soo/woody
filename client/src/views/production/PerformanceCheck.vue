<!-- 생산 실적 조회 -->
<!-- src/views/production/PerformanceCheck.vue -->
<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard>
    <!-- 상단 검색영역 -->
    <div class="search-card">
      <h5 class="pane-title">생산실적조회</h5>

      <v-row class="mt-2" dense>
        <v-col cols="12" md="4">
          <v-text-field label="지시번호" v-model.trim="q.issueNumber" dense outlined placeholder="예) WO-20250811-2856" />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field label="제품명" v-model.trim="q.productName" dense outlined placeholder="예) 블랙 데스크" />
        </v-col>

        <v-col cols="12" md="4">
          <v-select
            label="제품유형"
            v-model="q.productType"
            :items="[
              { title: '전체', value: '' },
              { title: '완제품', value: '완제품' },
              { title: '반제품', value: '반제품' }
            ]"
            dense
            outlined
            clearable
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field label="시작일시" v-model="q.startAt" type="datetime-local" dense outlined />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field label="종료일시" v-model="q.endAt" type="datetime-local" dense outlined />
        </v-col>
      </v-row>

      <!-- 검색 버튼 (중앙 정렬 유지) -->
      <div class="search-actions">
        <v-btn variant="flat" color="error" @click="resetQuery">초기화</v-btn>
        <v-btn class="ml-2" color="darkText" @click="doSearch">검색</v-btn>
      </div>

      <!-- 선택 요약 -->
      <div class="mini-summary" v-if="result">
        <v-alert type="info" variant="tonal" density="compact">
          지시번호: <b>{{ result.issueNumber }}</b>
          <span class="divider">|</span>
          제품명: {{ result.productName }}
          <span class="divider">|</span>
          제품유형: {{ result.productType }}
        </v-alert>
      </div>
    </div>

    <!-- 상단 기본정보 패널 (검색 성공 시에만 표시) -->
    <v-card class="info-card mt-4" variant="outlined" v-if="result">
      <v-card-title class="py-2">기본정보</v-card-title>
      <v-card-text>
        <v-row class="mb-2" dense>
          <v-col cols="12" md="4">
            <v-text-field label="지시번호" v-model="form.issueNumber" readonly dense outlined />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field label="지시일자" v-model="form.orderDate" type="date" dense outlined />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field label="작성자" v-model="form.contact" dense outlined />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field label="제품코드" v-model="form.productCode" readonly dense outlined />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field label="납기일자" v-model="form.dueDate" type="date" dense outlined />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              label="목표수량"
              v-model.number="form.targetQty"
              type="number"
              min="0"
              step="1"
              dense
              outlined
              @input="recalcNeed"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field label="제품명칭" v-model="form.productName" readonly dense outlined />
          </v-col>
        </v-row>

        <!-- 목표/실적/미생산 요약 배지 -->
        <div class="summary-chips">
          <v-chip size="small" variant="tonal">목표 {{ (form.targetQty ?? 0).toLocaleString() }}</v-chip>
          <v-chip size="small" color="primary" variant="tonal">기생산 {{ producedTotal.toLocaleString() }}</v-chip>
          <v-chip size="small" color="error" variant="tonal"
            >미생산 {{ Math.max((form.targetQty || 0) - producedTotal, 0).toLocaleString() }}</v-chip
          >
        </div>
      </v-card-text>
    </v-card>

    <!-- 결과 그리드 -->
    <div class="section-head mt-4">
      <h5 class="pane-title">조회결과</h5>
    </div>

    <ag-grid-vue
      class="ag-theme-quartz ag-no-wrap"
      :rowData="rows"
      :columnDefs="colDefs"
      :pagination="true"
      :paginationPageSize="10"
      :domLayout="'autoHeight'"
      @grid-ready="onGridReady"
      @first-data-rendered="sizeFit"
      @grid-size-changed="sizeFit"
    />

    <!-- 소계 -->
    <v-card class="mt-3 pa-3" variant="outlined">
      <div class="totals">
        <div>
          소요시간 합계: <b>{{ totalDurationText }}</b>
        </div>
        <div>
          지시량 합계: <b>{{ totals.orderQty }}</b>
        </div>
        <div>
          투입량 합계: <b>{{ totals.inputQty }}</b>
        </div>
        <div>
          불량량 합계: <b>{{ totals.defectQty }}</b>
        </div>
        <div>
          생산량 합계: <b>{{ totals.outputQty }}</b>
        </div>
      </div>
    </v-card>
  </UiParentCard>
</template>

<script setup>
import { ref, shallowRef, computed, markRaw } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { AgGridVue } from 'ag-grid-vue3';

/* ===== 페이지 헤더 ===== */
const page = ref({ title: '생산 실적 조회' });
const breadcrumbs = shallowRef([
  { title: '생산', disabled: true, href: '#' },
  { title: '생산 실적 조회', disabled: false, href: '#' }
]);

/* ===== 검색 상태 ===== */
const q = ref({
  issueNumber: '',
  productName: '',
  productType: '',
  startAt: '',
  endAt: ''
});

function resetQuery() {
  q.value.issueNumber = '';
  q.value.productName = '';
  q.value.productType = '';
  q.value.startAt = '';
  q.value.endAt = '';
  // 결과도 초기화
  result.value = null;
  rows.value = [];
  resetForm();
  sizeFit();
}

/* ===== 더미 데이터 / 유틸 ===== */
function pad2(n) {
  return String(n).padStart(2, '0');
}
function toDT(y, m, d, hh, mm) {
  return `${y}-${pad2(m)}-${pad2(d)}T${pad2(hh)}:${pad2(mm)}`;
}
const processOrder = ['재단', '가공', '연마', '도장', '조립'];

const perfDB = shallowRef([
  /* ... (기존 더미 데이터 그대로) ... */
  {
    issueNumber: 'WO-20250811-2856',
    productCode: 'P001',
    productName: '블랙 데스크',
    productType: '완제품',
    items: [
      {
        process: '재단',
        worker: '최윤수',
        startAt: toDT(2025, 8, 11, 9, 10),
        endAt: toDT(2025, 8, 11, 10, 20),
        orderQty: 50,
        inputQty: 50,
        defectQty: 0,
        outputQty: 50
      },
      {
        process: '가공',
        worker: '김성수',
        startAt: toDT(2025, 8, 11, 10, 30),
        endAt: toDT(2025, 8, 11, 12, 0),
        orderQty: 50,
        inputQty: 50,
        defectQty: 2,
        outputQty: 48
      },
      {
        process: '연마',
        worker: '정경준',
        startAt: toDT(2025, 8, 11, 13, 10),
        endAt: toDT(2025, 8, 11, 14, 0),
        orderQty: 50,
        inputQty: 48,
        defectQty: 1,
        outputQty: 47
      },
      {
        process: '도장',
        worker: '김태완',
        startAt: toDT(2025, 8, 11, 14, 20),
        endAt: toDT(2025, 8, 11, 16, 10),
        orderQty: 50,
        inputQty: 47,
        defectQty: 1,
        outputQty: 46
      },
      {
        process: '조립',
        worker: '이동현',
        startAt: toDT(2025, 8, 11, 16, 30),
        endAt: toDT(2025, 8, 11, 17, 10),
        orderQty: 50,
        inputQty: 46,
        defectQty: 0,
        outputQty: 46
      }
    ]
  },
  {
    issueNumber: 'WO-20250705-4112',
    productCode: 'P001',
    productName: '블랙 데스크',
    productType: '완제품',
    items: [
      {
        process: '재단',
        worker: '최윤수',
        startAt: toDT(2025, 7, 5, 9, 0),
        endAt: toDT(2025, 7, 5, 10, 0),
        orderQty: 120,
        inputQty: 120,
        defectQty: 0,
        outputQty: 120
      },
      {
        process: '가공',
        worker: '김성수',
        startAt: toDT(2025, 7, 5, 10, 10),
        endAt: toDT(2025, 7, 5, 12, 30),
        orderQty: 120,
        inputQty: 120,
        defectQty: 5,
        outputQty: 115
      },
      {
        process: '연마',
        worker: '정경준',
        startAt: toDT(2025, 7, 5, 13, 0),
        endAt: toDT(2025, 7, 5, 13, 50),
        orderQty: 120,
        inputQty: 115,
        defectQty: 1,
        outputQty: 114
      },
      {
        process: '도장',
        worker: '김태완',
        startAt: toDT(2025, 7, 5, 14, 10),
        endAt: toDT(2025, 7, 5, 16, 30),
        orderQty: 120,
        inputQty: 114,
        defectQty: 2,
        outputQty: 112
      },
      {
        process: '조립',
        worker: '이동현',
        startAt: toDT(2025, 7, 5, 16, 40),
        endAt: toDT(2025, 7, 5, 17, 20),
        orderQty: 120,
        inputQty: 112,
        defectQty: 0,
        outputQty: 112
      }
    ]
  },
  {
    issueNumber: 'WO-20250621-1023',
    productCode: 'P002',
    productName: '화이트 데스크',
    productType: '반제품',
    items: [
      {
        process: '재단',
        worker: '최은수',
        startAt: toDT(2025, 6, 21, 9, 10),
        endAt: toDT(2025, 6, 21, 10, 0),
        orderQty: 200,
        inputQty: 200,
        defectQty: 0,
        outputQty: 200
      },
      {
        process: '가공',
        worker: '김성수',
        startAt: toDT(2025, 6, 21, 10, 10),
        endAt: toDT(2025, 6, 21, 12, 40),
        orderQty: 200,
        inputQty: 200,
        defectQty: 4,
        outputQty: 196
      },
      {
        process: '연마',
        worker: '정경준',
        startAt: toDT(2025, 6, 21, 13, 20),
        endAt: toDT(2025, 6, 21, 14, 10),
        orderQty: 200,
        inputQty: 196,
        defectQty: 2,
        outputQty: 194
      },
      {
        process: '도장',
        worker: '김태완',
        startAt: toDT(2025, 6, 21, 14, 30),
        endAt: toDT(2025, 6, 21, 15, 50),
        orderQty: 200,
        inputQty: 194,
        defectQty: 1,
        outputQty: 193
      }
      // 반제품은 조립 없음
    ]
  }
]);

/* ===== 검색 실행 결과 상태 ===== */
const result = ref(null);
const rows = ref([]);

/* ===== 폼(상단 기본정보) ===== */
const form = ref({
  issueNumber: '',
  orderDate: '',
  contact: '',
  productCode: '',
  dueDate: '',
  targetQty: 0,
  productName: ''
});
function resetForm() {
  form.value = { issueNumber: '', orderDate: '', contact: '', productCode: '', dueDate: '', targetQty: 0, productName: '' };
}

/* ===== 검색 로직 ===== */
function inRange(dt) {
  const from = q.value.startAt ? new Date(q.value.startAt).getTime() : null;
  const to = q.value.endAt ? new Date(q.value.endAt).getTime() : null;
  const t = new Date(dt).getTime();
  if (from && t < from) return false;
  if (to && t > to) return false;
  return true;
}

function doSearch() {
  const kwNo = q.value.issueNumber.trim();
  const kwName = q.value.productName.trim();
  const type = q.value.productType;

  let hit = null;
  if (kwNo) hit = perfDB.value.find((x) => x.issueNumber.includes(kwNo));
  if (!hit && (kwName || type)) {
    hit = perfDB.value.find((x) => (!kwName || x.productName.includes(kwName)) && (!type || x.productType === type));
  }

  if (!hit) {
    result.value = null;
    rows.value = [];
    resetForm();
    alert('검색결과가 없습니다.');
    sizeFit();
    return;
  }

  result.value = hit;

  const base = [...hit.items].sort((a, b) => processOrder.indexOf(a.process) - processOrder.indexOf(b.process));
  const ranged = base.filter((r) => (!q.value.startAt && !q.value.endAt) || inRange(r.startAt) || inRange(r.endAt));
  rows.value = ranged.map((r, i) => ({
    seq: i + 1,
    ...r,
    startText: r.startAt.replace('T', ' '),
    endText: r.endAt.replace('T', ' '),
    durationMin: diffMinutes(r.startAt, r.endAt)
  }));

  const firstStart = hit.items?.[0]?.startAt ?? '';
  const lastEnd = hit.items?.[hit.items.length - 1]?.endAt ?? '';
  form.value.issueNumber = hit.issueNumber;
  form.value.orderDate = (firstStart || '').split('T')[0] || '';
  form.value.contact = '홍길동';
  form.value.productCode = hit.productCode;
  form.value.dueDate = (lastEnd || '').split('T')[0] || '';
  form.value.targetQty = hit.items?.[0]?.orderQty ?? 0;
  form.value.productName = hit.productName;

  sizeFit();
}

/* ===== 실적 합계/요약 ===== */
function requiredProcessNames(productType) {
  return productType === '반제품' ? ['재단', '가공', '연마', '도장'] : ['재단', '가공', '연마', '도장', '조립'];
}
const producedTotal = computed(() => {
  const hit = result.value;
  if (!hit) return 0;
  const req = requiredProcessNames(hit.productType);
  const outs = req.map((name) => hit.items.find((it) => it.process === name)?.outputQty ?? 0);
  if (!outs.length) return 0;
  return Math.max(0, Math.min(...outs));
});
function recalcNeed() {}

/* ===== 소계 ===== */
const totals = computed(() => {
  const t = { orderQty: 0, inputQty: 0, defectQty: 0, outputQty: 0, durationMin: 0 };
  rows.value.forEach((r) => {
    t.orderQty += r.orderQty || 0;
    t.inputQty += r.inputQty || 0;
    t.defectQty += r.defectQty || 0;
    t.outputQty += r.outputQty || 0;
    t.durationMin += r.durationMin || 0;
  });
  return t;
});
const totalDurationText = computed(() => toHrMin(totals.value.durationMin));

/* ===== 유틸 ===== */
function diffMinutes(a, b) {
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / 60000));
}
function toHrMin(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/* ===== AG Grid ===== */
let gridApi;
function onGridReady(e) {
  gridApi = e.api;
  sizeFit();
}
function sizeFit() {
  gridApi?.sizeColumnsToFit();
}
const colDefs = markRaw([
  { headerName: '공정명', field: 'process', width: 110, cellClass: 'cell-ellipsis' },
  { headerName: '작업자', field: 'worker', width: 100, cellClass: 'cell-ellipsis' },
  { headerName: '시작일시', field: 'startText', minWidth: 160, flex: 1, cellClass: 'cell-ellipsis' },
  { headerName: '종료일시', field: 'endText', minWidth: 160, flex: 1, cellClass: 'cell-ellipsis' },
  {
    headerName: '소요시간(시:분)',
    field: 'durationMin',
    width: 130,
    valueFormatter: (p) => (p.value == null ? '' : toHrMin(p.value)),
    cellClass: 'ag-right-aligned-cell'
  },
  { headerName: '지시량', field: 'orderQty', width: 100, cellClass: 'ag-right-aligned-cell' },
  { headerName: '투입량', field: 'inputQty', width: 100, cellClass: 'ag-right-aligned-cell' },
  { headerName: '불량량', field: 'defectQty', width: 100, cellClass: 'ag-right-aligned-cell' },
  { headerName: '생산량', field: 'outputQty', width: 100, cellClass: 'ag-right-aligned-cell' }
]);
</script>

<style scoped>
.pane-title {
  margin: 0;
  font-weight: 600;
}
.search-card {
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

/* ✅ 검색 버튼 중앙정렬 */
.search-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 6px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.divider {
  margin: 0 8px;
  color: #9ca3af;
}
.mini-summary {
  margin-top: 10px;
}

.info-card .v-card-title {
  font-weight: 700;
}
.summary-chips {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

/* ag-grid looks */
.ag-no-wrap .ag-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ag-theme-quartz {
  --ag-font-size: 12px;
  --ag-grid-size: 4px;
}
.cell-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 합계 박스 */
.totals {
  display: grid;
  grid-template-columns: repeat(5, auto);
  gap: 16px;
}
@media (max-width: 960px) {
  .totals {
    grid-template-columns: repeat(2, auto);
  }
}

/* 공용 마진/간격 */
.ml-2 {
  margin-left: 8px;
}
.mt-4 {
  margin-top: 1rem;
}
</style>
