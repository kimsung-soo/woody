<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>

  <UiParentCard>
    <v-row class="mb-4">
      <v-col cols="3">
        <v-text-field label="검사완료일자" v-model="form.chkedDate" type="date" dense outlined />
      </v-col>
      <v-col cols="3">
        <v-text-field label="검사번호" v-model="form.certId" dense outlined />
      </v-col>
      <v-col cols="3">
        <v-text-field label="제품명" v-model="form.prdName" dense outlined />
      </v-col>
      <v-col cols="3">
        <v-text-field label="제품유형" v-model="form.prdType" dense outlined />
      </v-col>
    </v-row>
    <br />
    <ag-grid-vue :rowData="gridData" :columnDefs="colDefs" :theme="quartz" :gridOptions="myGridOptions" style="height: 400px" />
  </UiParentCard>
</template>

<script setup>
import { ref, shallowRef, computed } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3'; // Vue Data Grid Component
import UiParentCard from '@/components/shared/UiParentCard.vue';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const quartz = themeQuartz;

const page = ref({ title: '제품검사성적서 조회' });
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
  chkedDate: '',
  certId: '',
  prdName: '',
  prdType: ''
});

// 한글 헤더는 headerName으로
const colDefs = ref([
  { headerName: '검사번호', field: 'certId' },
  { headerName: '제품코드', field: 'prdCode' },
  { headerName: '제품명', field: 'prdName' },
  { headerName: '검사완료일자', field: 'chkedDate' },
  { headerName: '제품유형', field: 'prdType' }
]);

const rowData = ref([
  { certId: 'QC100', prdCode: 'DSK100', prdName: '흰색학생책상', chkedDate: '2025-08-12', prdType: '완제품' },
  { certId: 'QC101', prdCode: 'DSK101', prdName: '검은색학생책상', chkedDate: '2025-08-12', prdType: '완제품' },
  { certId: 'QC102', prdCode: 'DSK102', prdName: '파란색학생책상', chkedDate: '2025-08-12', prdType: '반제품' },
  { certId: 'QC103', prdCode: 'DSK103', prdName: '노란색학생책상', chkedDate: '2025-08-12', prdType: '반제품' },
  { certId: 'QC104', prdCode: 'DSK104', prdName: '분홍색학생책상', chkedDate: '2025-08-12', prdType: '완제품' }
]);

// 검색활성화
const gridData = computed(() => {
  const date = (form.value.chkedDate || '').trim(); // 날짜는 소문자 불필요
  const cid = (form.value.certId || '').trim().toLowerCase();
  const prdn = (form.value.prdName || '').trim().toLowerCase();
  const prdt = (form.value.prdType || '').trim().toLowerCase();

  const toL = (v) => (v ?? '').toString().toLowerCase().trim();

  return rowData.value.filter((r) => {
    const byChkDate = !date || (r.chkedDate ?? '').includes(date);
    const byCid = !cid || toL(r.certId).includes(cid); // 부분일치
    const byPrdn = !prdn || toL(r.prdName).includes(prdn); //  제품명 포함 검색
    const byPrdt = !prdt || toL(r.prdType).includes(prdt); //  유형 포함(또는 ===)
    return byChkDate && byCid && byPrdn && byPrdt;
  });
});

const myGridOptions = ref({
  defaultColDef: { flex: 1, minWidth: 100, resizable: true },
  columnDefs: colDefs,
  pagination: true,
  paginationAutoPageSize: true
});
</script>
