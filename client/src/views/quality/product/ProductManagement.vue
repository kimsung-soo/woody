<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>

  <UiParentCard>
    <v-row class="mb-4">
      <v-col cols="3">
        <v-text-field label="공정완료일자" v-model="form.chkedDate" type="date" dense outlined />
      </v-col>
    </v-row>
    <br />
    <ag-grid-vue
      :rowData="gridData"
      :columnDefs="colDefs"
      :theme="quartz"
      :gridOptions="myGridOptions"
      @row-clicked="onRowClicked"
      style="height: 400px"
    />
  </UiParentCard>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref, shallowRef, computed } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';
import UiParentCard from '@/components/shared/UiParentCard.vue';

ModuleRegistry.registerModules([AllCommunityModule]);

const quartz = themeQuartz;
const router = useRouter();

const page = ref({ title: '제품검사성적서 관리' });
const breadcrumbs = shallowRef([
  {
    title: '품질',
    disabled: true,
    href: '#'
  },
  {
    title: '성적서조회',
    disabled: false,
    href: '#'
  }
]);

const form = ref({
  chkedDate: ''
});

// 컬럼 정의
const colDefs = ref([
  { headerName: '제품유형', field: 'prdType' },
  { headerName: '제품코드', field: 'prdCode' },
  { headerName: '제품명', field: 'prdName' },
  { headerName: '수량', field: 'prdQty' },
  { headerName: '작성자', field: 'prdWorker' },
  { headerName: '생산상태', field: 'prdStatus' },
  { headerName: '공정완성일', field: 'prdEnd' }
]);

const rowData = ref([
  {
    prdType: '완제품',
    prdCode: 'DSK100',
    prdName: '흰색학생책상',
    prdQty: 20,
    prdWorker: '작업자1',
    prdStatus: '생산완료',
    prdEnd: '2025-08-12'
  },
  {
    prdType: '완제품',
    prdCode: 'DSK101',
    prdName: '검은색학생책상',
    prdQty: 30,
    prdWorker: '작업자2',
    prdStatus: '생산완료',
    prdEnd: '2025-08-12'
  },
  {
    prdType: '완제품',
    prdCode: 'DSK102',
    prdName: '파란색학생책상',
    prdQty: 20,
    prdWorker: '작업자3',
    prdStatus: '생산완료',
    prdEnd: '2025-08-12'
  },
  {
    prdType: '완제품',
    prdCode: 'DSK103',
    prdName: '갈색학생책상',
    prdQty: 20,
    prdWorker: '작업자4',
    prdStatus: '생산완료',
    prdEnd: '2025-08-13'
  },
  {
    prdType: '완제품',
    prdCode: 'DSK104',
    prdName: '분홍색학생책상',
    prdQty: 20,
    prdWorker: '작업자5',
    prdStatus: '생산완료',
    prdEnd: '2025-08-15'
  }
]);

// 검색활성화
const gridData = computed(() => {
  const date = (form.value.chkedDate || '').trim(); // 날짜는 소문자 불필요

  return rowData.value.filter((r) => {
    const byChkDate = !date || (r.chkedDate ?? '').includes(date);
    return byChkDate;
  });
});

const myGridOptions = ref({
  defaultColDef: { flex: 1, minWidth: 100, resizable: true },
  columnDefs: colDefs,
  pagination: true,
  paginationAutoPageSize: true
});

// 행 클릭 이벤트 핸들러
const onRowClicked = (event) => {
  const rowData = event.data;
  console.log('클릭된 행:', rowData);

  // /qm/qrdpass 경로로 이동하면서 데이터 전달
  router.push({
    path: '/qm/prdmngcert',
    query: {
      prdCode: rowData.prdCode
    }
  });

  // 또는 단순히 경로만 이동하고 싶다면:
  // router.push('/qm/qrdpass');
};
</script>
