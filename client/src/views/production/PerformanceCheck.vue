<!-- src/views/production/PerformanceCheck.vue -->
<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard>
    <!-- 상단 검색영역 -->
    <div class="search-card">
      <h5 class="pane-title">생산실적조회</h5>

      <v-row class="mt-2" dense>
        <v-col cols="12" md="4">
          <v-text-field
            label="지시번호"
            v-model.trim="q.issueNumber"
            density="compact"
            variant="outlined"
            placeholder="예) WO-20250811-2856"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field label="제품명" v-model.trim="q.productName" density="compact" variant="outlined" placeholder="예) 블랙 데스크" />
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
            density="compact"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field label="시작일시" v-model="q.startAt" type="datetime-local" density="compact" variant="outlined" />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field label="종료일시" v-model="q.endAt" type="datetime-local" density="compact" variant="outlined" />
        </v-col>

        <v-col cols="12" md="4" class="btn-center">
          <div class="btn-group">
            <v-btn variant="tonal" @click="resetQuery">초기화</v-btn>
            <v-btn color="primary" class="ml-2" @click="doSearch">검색</v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- 선택 요약 -->
      <div class="mini-summary" v-if="headerInfo">
        <v-alert type="info" variant="tonal" density="compact">
          지시번호: <b>{{ headerInfo.issueNumber }}</b>
          <span class="divider">|</span>
          제품명: {{ headerInfo.productName }}
          <span class="divider">|</span>
          제품유형: {{ headerInfo.productType }}
        </v-alert>
      </div>
    </div>

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
}
function doSearch() {
  // computed 기반이라 여기선 칼럼 사이즈만
  sizeFit();
}

/* ===== 더미 데이터(단건 조회용) =====
   - issueNumber별로 공정 실적 목록을 갖는 형태
   - 실제 연동 시 API: GET /performances?issueNumber=...&from=...&to=...
*/
function pad2(n) {
  return String(n).padStart(2, '0');
}
function toDT(y, m, d, hh, mm) {
  return `${y}-${pad2(m)}-${pad2(d)}T${pad2(hh)}:${pad2(mm)}`;
}
const processOrder = ['재단', '가공', '연마', '도장', '조립'];

const perfDB = shallowRef([
  {
    issueNumber: 'WO-20250811-2856',
    productCode: 'P001',
    productName: '블랙 데스크',
    productType: '완제품',
    items: [
      // 공정명, 작업자, 시작~종료, 지시량/투입량/불량/생산
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
        worker: '최윤수',
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
      // 반제품이라 '조립' 없음
    ]
  }
]);

/* ===== 필터링 & 결과 ===== */
const headerInfo = computed(() => {
  // issueNumber 우선 → 없으면 제품명/유형으로 첫 항목
  const kwNo = q.value.issueNumber.trim();
  const kwName = q.value.productName.trim();
  const type = q.value.productType;

  let hit = null;
  if (kwNo) hit = perfDB.value.find((x) => x.issueNumber.includes(kwNo));
  if (!hit && (kwName || type)) {
    hit = perfDB.value.find((x) => (!kwName || x.productName.includes(kwName)) && (!type || x.productType === type));
  }
  return hit || null;
});

function inRange(dt) {
  const from = q.value.startAt ? new Date(q.value.startAt).getTime() : null;
  const to = q.value.endAt ? new Date(q.value.endAt).getTime() : null;
  const t = new Date(dt).getTime();
  if (from && t < from) return false;
  if (to && t > to) return false;
  return true;
}

const rows = computed(() => {
  if (!headerInfo.value) return [];
  // 공정 순서대로 정렬
  const base = [...headerInfo.value.items].sort((a, b) => processOrder.indexOf(a.process) - processOrder.indexOf(b.process));
  // 기간 필터
  const ranged = base.filter((r) => (!q.value.startAt && !q.value.endAt) || inRange(r.startAt) || inRange(r.endAt));
  // 표시용 포맷
  return ranged.map((r, i) => ({
    seq: i + 1,
    ...r,
    startText: r.startAt.replace('T', ' '),
    endText: r.endAt.replace('T', ' '),
    durationMin: diffMinutes(r.startAt, r.endAt)
  }));
});

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
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.round(ms / 60000));
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
.btn-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-group {
  display: flex;
  align-items: center;
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
</style>
