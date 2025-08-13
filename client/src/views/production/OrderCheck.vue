<!-- 작업지시 조회 -->
<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard>
    <!-- 검색 조건 -->
    <v-row class="mb-4" dense>
      <v-col cols="3">
        <v-text-field label="지시번호" v-model.trim="searchForm.issueNumber" dense outlined hide-details />
      </v-col>
      <v-col cols="3">
        <v-text-field label="제품코드" v-model.trim="searchForm.productCode" dense outlined hide-details />
      </v-col>
      <v-col cols="3">
        <v-text-field label="제품명" v-model.trim="searchForm.productName" dense outlined hide-details />
      </v-col>
      <v-col cols="3">
        <v-text-field label="작성자" v-model.trim="searchForm.contact" dense outlined hide-details />
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
      class="ag-theme-quartz ag-no-wrap"
      :rowData="pagedOrders"
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
import { ref, shallowRef, computed } from 'vue';
import { useRouter } from 'vue-router';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { AgGridVue } from 'ag-grid-vue3';

const router = useRouter();

const page = ref({ title: '작업지시 조회' });
const breadcrumbs = shallowRef([
  { title: '생산', disabled: true, href: '#' },
  { title: '작업지시 조회', disabled: false, href: '#' }
]);

// 검색 폼
const searchForm = ref({
  issueNumber: '',
  productCode: '',
  productName: '',
  contact: ''
});

// 더미 데이터
function makeOrders() {
  return [
    {
      issueNumber: 'WO-20250811-2856',
      orderDate: '2025-08-11',
      contact: '이민호',
      productCode: 'P001',
      productName: '블랙 데스크',
      dueDate: '2025-08-25',
      targetQty: 50,
      inputMaterial: '합판, 철재',
      productType: '완제품'
    },
    {
      issueNumber: 'WO-20250621-1023',
      orderDate: '2025-06-21',
      contact: '이민우',
      productCode: 'P002',
      productName: '화이트 데스크',
      dueDate: '2025-09-23',
      targetQty: 200,
      inputMaterial: '합판, 재공품',
      productType: '반제품'
    }
    // ...데이터 추가
  ];
}

const orders = ref(makeOrders());
const PAGE_SIZE = 10;

// 필터링
const filteredOrders = computed(() => {
  return orders.value.filter((o) => {
    return (
      (!searchForm.value.issueNumber || o.issueNumber.includes(searchForm.value.issueNumber)) &&
      (!searchForm.value.productCode || o.productCode.includes(searchForm.value.productCode)) &&
      (!searchForm.value.productName || o.productName.includes(searchForm.value.productName)) &&
      (!searchForm.value.contact || o.contact.includes(searchForm.value.contact))
    );
  });
});

const pagedOrders = computed(() => filteredOrders.value);

function applySearch() {
  sizeFit();
}

function resetFilters() {
  searchForm.value = { issueNumber: '', productCode: '', productName: '', contact: '' };
  sizeFit();
}

// ag-grid
const textCell = {
  cellStyle: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  tooltipValueGetter: (p) => p.value
};
const numRight = { ...textCell, cellClass: 'ag-right-aligned-cell' };

const colDefs = [
  { headerName: '지시번호', field: 'issueNumber', flex: 1.4, minWidth: 160, ...textCell },
  { headerName: '지시일자', field: 'orderDate', flex: 0.9, minWidth: 120, ...textCell },
  { headerName: '작성자', field: 'contact', flex: 0.8, minWidth: 90, ...textCell },
  { headerName: '제품코드', field: 'productCode', flex: 0.9, minWidth: 110, ...textCell },
  { headerName: '납기일자', field: 'dueDate', flex: 0.9, minWidth: 120, ...textCell },
  { headerName: '목표수량', field: 'targetQty', flex: 0.7, minWidth: 90, ...numRight },
  { headerName: '제품명칭', field: 'productName', flex: 1.4, minWidth: 160, ...textCell },
  { headerName: '투입자재', field: 'inputMaterial', flex: 1.2, minWidth: 140, ...textCell },
  { headerName: '제품유형', field: 'productType', flex: 0.8, minWidth: 90, ...textCell }
];

let gridApi;
function onGridReady(e) {
  gridApi = e.api;
  sizeFit();
}
function sizeFit() {
  if (gridApi) gridApi.sizeColumnsToFit();
}

function goDetail(ev) {
  const row = ev?.data;
  if (!row) return;
  router.push({ name: 'OrderModify', query: { issue: row.issueNumber } });
}
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
</style>
