<template>
  <div>
    <h2>제품검수서 작성</h2>
    <ag-grid-vue :rowData="rowData" :columnDefs="colDefs" rowSelection="single" class="ag-theme-quartz" style="height: 500px" />
  </div>
  <div>
    <ag-grid-vue :rowData="rowData" :columnDefs="colDefs" rowSelection="single" class="ag-theme-quartz" style="height: 500px" />
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { AllCommunityModule, ModuleRegistry, type ColDef } from 'ag-grid-community';

// (권장) AG Grid CSS (v31+)
// import 'ag-grid-community/styles/ag-grid.css';
// import 'ag-grid-community/styles/ag-theme-quartz.css';

// 커뮤니티 모듈 등록
ModuleRegistry.registerModules([AllCommunityModule]);

// 타입
interface ProductionManagement {
  검사기준: string;
  허용수치: string;
  측정값: string;
  판정: boolean;
}

// 데이터
const rowData: Ref<ProductionManagement[]> = ref([
  { 검사기준: '함수율', 허용수치: '수분 함량이 12 ~ 13% 이하', 측정값: '12', 판정: true },
  { 검사기준: '치수정밀도', 허용수치: '입고자재에서 ± 2mm 이내', 측정값: '1', 판정: true },
  { 검사기준: '강도/내구성', 허용수치: '휨강도 35MPa 이상', 측정값: '40', 판정: true }
]);

// 컬럼
const colDefs: Ref<ColDef<ProductionManagement>[]> = ref([
  { field: '검사기준' },
  { field: '허용수치' },
  { field: '측정값' },
  { field: '판정' }
]);
</script>

<style scoped>
/* 선택: 높이는 style로 주었고, 폭/정렬 등은 필요 시 여기에 */
</style>
