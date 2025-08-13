<!-- 생산계획조회 -->
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
        <v-btn variant="flat" color="error" class="mx-2" @click="resetFilters"> 초기화 </v-btn>
        <v-btn variant="flat" color="darkText" class="mx-2" @click="applySearch"> 검색 </v-btn>
      </v-col>
    </v-row>

    <!-- 목록 -->
    <ag-grid-vue
      class="ag-theme-quartz ag-no-wrap mt-4"
      :rowData="pagedPlans"
      :columnDefs="colDefs"
      :pagination="true"
      :paginationPageSize="PAGE_SIZE"
      :suppressPaginationPanel="false"
      :domLayout="'autoHeight'"
      rowSelection="single"
      @grid-ready="onGridReady"
      @first-data-rendered="sizeFit"
      @grid-size-changed="sizeFit"
      @row-double-clicked="goDetail"
    />
  </UiParentCard>
</template>

<script setup>
import { ref, shallowRef, computed, markRaw } from 'vue';
import { useRouter } from 'vue-router';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { AgGridVue } from 'ag-grid-vue3';

const router = useRouter();

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

/* 더미 데이터 */
function makePlans() {
  return [
    {
      planNo: 'PL-20250811-1234',
      planName: '생산예방물량',
      createdAt: '2025-08-11',
      writer: '이동현',
      totalQty: 100,
      dueDate: '2025-08-30',
      remark: '납기일지켜주세요'
    },
    {
      planNo: 'PL-20250726-2201',
      planName: '월간생산',
      createdAt: '2025-07-26',
      writer: '김찬용',
      totalQty: 200,
      dueDate: '2025-08-25',
      remark: '불량체크 꼼꼼히'
    },
    {
      planNo: 'PL-20250626-9010',
      planName: '재고보충',
      createdAt: '2025-06-26',
      writer: '김근영',
      totalQty: 150,
      dueDate: '2025-07-21',
      remark: '빠르게'
    }
  ];
}
const plans = ref(makePlans());
const PAGE_SIZE = 10;

/* 필터링 */
const filteredPlans = computed(() => {
  const { planNo, planName, writer, dueDate } = search.value;
  return plans.value.filter((p) => {
    const okNo = !planNo || p.planNo.includes(planNo);
    const okName = !planName || p.planName.includes(planName);
    const okWriter = !writer || p.writer.includes(writer);
    const okDue = !dueDate || p.dueDate === dueDate;
    return okNo && okName && okWriter && okDue;
  });
});
const pagedPlans = computed(() => filteredPlans.value);

/* 동작 */
function applySearch() {
  sizeFit(); // 단순 리사이즈
}
function resetFilters() {
  search.value = { planNo: '', planName: '', writer: '', dueDate: '' };
  sizeFit();
}

/* ag-Grid */
const textCell = {
  cellStyle: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  tooltipValueGetter: (p) => p.value
};
const numRight = { ...textCell, cellClass: 'ag-right-aligned-cell' };

const colDefs = markRaw([
  { headerName: '계획번호', field: 'planNo', flex: 1.3, minWidth: 160, ...textCell },
  { headerName: '계획명', field: 'planName', flex: 1.4, minWidth: 160, ...textCell },
  { headerName: '작성일자', field: 'createdAt', flex: 0.9, minWidth: 120, ...textCell },
  { headerName: '작성자', field: 'writer', flex: 0.8, minWidth: 90, ...textCell },
  { headerName: '총수량', field: 'totalQty', flex: 0.7, minWidth: 90, ...numRight },
  { headerName: '납기일자', field: 'dueDate', flex: 0.9, minWidth: 120, ...textCell },
  { headerName: '비고', field: 'remark', flex: 1.2, minWidth: 140, ...textCell }
]);

let gridApi;
function onGridReady(e) {
  gridApi = e.api;
  sizeFit();
}
function sizeFit() {
  gridApi?.sizeColumnsToFit();
}
function goDetail(ev) {
  const row = ev?.data;
  if (!row) return;
  // 상세 라우팅 이름은 프로젝트에 맞게 변경하세요.
  router.push({ name: 'ProductionPlanModify', query: { planNo: row.planNo } });
}
</script>

<style scoped>
/* 입력창 아래 버튼 중앙 정렬 */
.center-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 6px 0 10px;
}

/* ag-grid: 한 줄 말줄임 */
.ag-no-wrap .ag-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* Quartz 테마 컴팩트 */
.ag-theme-quartz {
  --ag-font-size: 12px;
  --ag-grid-size: 4px;
}
.mt-4 {
  margin-top: 1rem;
}
</style>
