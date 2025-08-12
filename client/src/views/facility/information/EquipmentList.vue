<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="설비 정보조회">
    <v-row align="center" class="mb-2">
      <v-col cols="12" md="8" class="d-flex align-center">
        <v-text-field
          v-model.trim="productKeyword"
          placeholder="공정선택"
          hide-details
          density="compact"
          variant="outlined"
          style="max-width: 280px"
        />

        <v-btn class="ml-2" color="darkText" @click="openModal('공정 조회', RowData, ColDefs)"> 검색 </v-btn>
      </v-col>
    </v-row>

    <MoDal ref="modalRef" :title="modalTitle" :rowData="modalRowData" :colDefs="modalColDefs" @confirm="modalConfirm" />

    <!-- AG Grid: 조회 전용 -->
    <ag-grid-vue
      style="height: 420px"
      :theme="quartz"
      :rowData="form.items"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :animateRows="true"
      :suppressClickEdit="true"
      @grid-ready="onGridReady"
    />
  </UiParentCard>
</template>

<script setup>
import { ref, reactive, shallowRef } from 'vue';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

import { AgGridVue } from 'ag-grid-vue3';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
const quartz = themeQuartz;

const columnDefs = ref([
  { field: '설비코드', flex: 1 },
  { field: '설비명', flex: 1 },
  { field: '설비유형', flex: 1 },
  {
    field: '사용유무',
    flex: 1,
    cellStyle: (params) => {
      if (params.value == '사용') return { color: 'blue', fontWeight: 'bold' };
      if (params.value == '정지') return { color: 'red', fontWeight: 'bold' };
      return null;
    }
  },
  { field: '제조사', flex: 1 },
  { field: '설비제조일', flex: 1 },
  { field: '설비설치일', flex: 1 },
  { field: '점검주기일', flex: 1 },
  { field: '고장유형', flex: 1 },
  { field: '담당자', flex: 1 }
]);

/* ===================== 검색/그리드 핸들러 ===================== */
const productKeyword = ref('');
const gridApi = ref(null);
const onGridReady = (e) => (gridApi.value = e.api);
const searchProducts = () => {
  gridApi.value?.setGridOption('quickFilterText', productKeyword.value || '');
};

/* ===================== 더미 데이터 ===================== */
const form = reactive({
  items: [
    {
      설비코드: 'EQ-001',
      설비명: '드릴 프레스',
      설비유형: '가공',
      사용유무: '사용',
      제조사: 'A사',
      설비제조일: '2025-01-15',
      설비설치일: '2025-02-18',
      점검주기일: 180,
      고장유형: '-',
      담당자: '최은수'
    },
    {
      설비코드: 'EQ-002',
      설비명: '직각 왕복 판톱',
      설비유형: '재단설비',
      사용유무: '사용',
      제조사: 'A사',
      설비제조일: '2025-01-15',
      설비설치일: '2025-02-18',
      점검주기일: 180,
      고장유형: '-',
      담당자: '이동섭'
    },
    {
      설비코드: 'EQ-003',
      설비명: 'CNC조각기',
      설비유형: '재단설비',
      사용유무: '정지',
      제조사: 'B사',
      설비제조일: '2024-11-15',
      설비설치일: '2025-02-18',
      점검주기일: 180,
      고장유형: '전기이상',
      담당자: '정경준'
    }
  ]
});

const defaultColDef = { editable: false, sortable: true, resizable: true };

const page = ref({ title: '설비 정보 관리' });
const breadcrumbs = shallowRef([
  { title: '설비', disabled: true, href: '#' },
  { title: '전체 조회', disabled: false, href: '#' }
]);

/* ===================== 공정 조회 모달 ===================== */
import MoDal from '@/views/common/NewModal.vue';

const modalRef = ref(null);
const modalTitle = ref('');
const modalRowData = ref([]);
const modalColDefs = ref([]);

const ColDefs = ref([
  { field: '공정코드', headerName: '공정코드', flex: 1 },
  { field: '공정명', headerName: '공정명', flex: 1 },
  { field: '설비유형', headerName: '설비유형', flex: 1 },
  { field: '등록일자', headerName: '등록일자', flex: 1, type: 'date' }
]);

const RowData = ref([
  { 공정코드: 'PRC-001', 공정명: '재단 공정', 설비유형: '절단기', 등록일자: '2025-07-01' },
  { 공정코드: 'PRC-002', 공정명: '연마 공정', 설비유형: '연마기', 등록일자: '2025-07-05' },
  { 공정코드: 'PRC-003', 공정명: '조립 공정', 설비유형: '조립대', 등록일자: '2025-07-10' }
]);

const openModal = (title, rowData, colDefs) => {
  modalTitle.value = title;
  modalRowData.value = rowData;
  modalColDefs.value = colDefs;
  modalRef.value?.open();
};

const modalConfirm = (selectedRow) => {
  if (!selectedRow) return;
  productKeyword.value = selectedRow.공정코드 || selectedRow.공정명 || '';
  searchProducts();
};
</script>
