<!-- src/views/production/ProductionCheck.vue -->
<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard>
    <!-- 검색 조건 -->
    <v-row class="mb-4" dense>
      <v-col cols="3">
        <v-text-field label="계획번호" v-model.trim="search.planNo" dense outlined hide-details placeholder="예) PL-20250811-1234" />
      </v-col>

      <v-col cols="3">
        <v-text-field label="계획명" v-model.trim="search.planName" dense outlined hide-details placeholder="예) 월간 생산 계획" />
      </v-col>

      <v-col cols="3">
        <v-text-field label="작성자" v-model.trim="search.writer" dense outlined hide-details placeholder="예) 홍길동" />
      </v-col>

      <v-col cols="3">
        <v-text-field label="납기일자" v-model="search.dueDate" type="date" dense outlined hide-details />
      </v-col>
    </v-row>

    <!-- 버튼 중앙 정렬 -->
    <v-row justify="center" class="mt-2 mb-4">
      <v-col cols="auto">
        <v-btn variant="flat" color="error" class="mx-2" @click="resetFilters">초기화</v-btn>
        <v-btn variant="flat" color="darkText" class="mx-2" @click="applySearch">검색</v-btn>
      </v-col>
    </v-row>

    <!-- 목록 -->
    <ag-grid-vue
      class="ag-theme-quartz ag-no-wrap mt-4"
      :rowData="plans"
      :columnDefs="colDefs"
      :pagination="true"
      :paginationPageSize="PAGE_SIZE"
      :suppressPaginationPanel="false"
      :domLayout="'autoHeight'"
      rowSelection="single"
      @grid-ready="onGridReady"
      @first-data-rendered="sizeFit"
      @grid-size-changed="sizeFit"
    />

    <div class="mt-4" style="text-align: right">
      <small class="muted">총 {{ total.toLocaleString() }}건</small>
    </div>

    <v-snackbar v-model="snack.open" :color="snack.color" :timeout="2000">
      {{ snack.msg }}
    </v-snackbar>
  </UiParentCard>
</template>

<script setup>
import { ref, shallowRef, markRaw, onMounted } from 'vue';
import axios from 'axios';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { AgGridVue } from 'ag-grid-vue3';

const API = 'http://localhost:3000';

/* 헤더 */
const page = ref({ title: '생산계획 조회' });
const breadcrumbs = shallowRef([
  { title: '생산', disabled: true, href: '#' },
  { title: '생산계획 조회', disabled: false, href: '#' }
]);

/* 검색 폼 */
const search = ref({
  planNo: '',
  planName: '',
  writer: '',
  dueDate: '' // yyyy-MM-dd
});

/* 서버 데이터 */
const plans = ref([]); // rows
const total = ref(0); // total count
const PAGE_SIZE = 10;

/* 검색 호출 */
async function fetchPlans() {
  try {
    // 서버는 kw만 받음
    const kw = (search.value.planNo || search.value.planName || '').trim();
    const { data } = await axios.get(`${API}/plans`, {
      params: { kw, page: 1, size: 200 }
    });
    if (data?.ok) {
      // 1차: 서버 결과
      const rows = data.rows ?? [];

      // 2차: 작성자/납기일자 프론트 필터
      const writer = (search.value.writer || '').trim();
      const dueDate = (search.value.dueDate || '').trim(); // yyyy-MM-dd

      plans.value = rows.filter((r) => (!writer || (r.writer || '').includes(writer)) && (!dueDate || r.dueDate === dueDate));
      total.value = data.total ?? plans.value.length ?? 0;

      sizeFit();
    } else {
      toast('조회 실패', 'error');
    }
  } catch (e) {
    console.error(e);
    toast('조회 중 오류', 'error');
  }
}

function applySearch() {
  fetchPlans();
}
function resetFilters() {
  search.value = { planNo: '', planName: '', writer: '', dueDate: '' };
  fetchPlans();
}

/* 최초 로드 시 목록 */
onMounted(() => {
  fetchPlans();
});

/* ag-Grid */
const textCell = {
  cellStyle: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  tooltipValueGetter: (p) => p.value
};
const numRight = { ...textCell, cellClass: 'ag-right-aligned-cell' };

const colDefs = markRaw([
  { headerName: '계획번호', field: 'planNo', flex: 1.3, minWidth: 160, ...textCell },
  { headerName: '계획명', field: 'planName', flex: 1.4, minWidth: 160, ...textCell },
  { headerName: '작성일자', field: 'createdDate', flex: 0.9, minWidth: 120, ...textCell },
  { headerName: '작성자', field: 'writer', flex: 0.8, minWidth: 90, ...textCell },
  { headerName: '총수량', field: 'totalQty', flex: 0.7, minWidth: 90, ...numRight },
  { headerName: '납기일자', field: 'dueDate', flex: 0.9, minWidth: 120, ...textCell },
  { headerName: '비고', field: 'memo', flex: 1.2, minWidth: 140, ...textCell }
]);

let gridApi;
function onGridReady(e) {
  gridApi = e.api;
  sizeFit();
}
function sizeFit() {
  gridApi?.sizeColumnsToFit();
}

/* 토스트 */
const snack = ref({ open: false, msg: '', color: 'primary' });
const toast = (msg, color = 'primary') => (snack.value = { open: true, msg, color });
</script>

<style scoped>
.ag-no-wrap .ag-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ag-theme-quartz {
  --ag-font-size: 12px;
  --ag-grid-size: 4px;
}
.mt-4 {
  margin-top: 1rem;
}
.muted {
  color: #6b7280;
}
</style>
