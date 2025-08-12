<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="설비 상태조회">
    <v-row align="center" class="mb-2">
      <v-col cols="12" md="6" class="d-flex justify-start">
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

    <!-- 공정 모달 -->
    <MoDal ref="modalRef" :title="modalTitle" :rowData="modalRowData" :colDefs="modalColDefs" @confirm="modalConfirm" />

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
    field: '설비상태',
    flex: 1,
    cellStyle: (params) => {
      if (params.value == '가동') return { color: 'blue', fontWeight: 'bold' };
      if (params.value == '비가동') return { color: 'red', fontWeight: 'bold' };
      return null;
    }
  },
  { field: '비가동사유', flex: 1 },
  { field: '점검완료일', flex: 1 },
  { field: '다음점검일', flex: 1 },
  { field: '담당자', flex: 1 }
]);

const productKeyword = ref('');
const gridApi = ref(null);
const onGridReady = (e) => {
  gridApi.value = e.api;
};
const searchProducts = () => {
  gridApi.value?.setGridOption('quickFilterText', productKeyword.value || '');
};

const defaultColDef = {
  editable: false,
  sortable: true,
  resizable: true
};

const page = ref({ title: '설비 상태관리' });
const breadcrumbs = shallowRef([
  { title: '설비 상태', disabled: true, href: '#' },
  { title: '전체 조회', disabled: false, href: '#' }
]);

const form = reactive({
  items: [
    {
      설비코드: 'EQ-001',
      설비명: '띠톱기계',
      설비유형: '재단공정',
      설비상태: '비가동',
      비가동사유: '전기 이상',
      점검완료일: '2025-01-15 17:00:53',
      다음점검일: '2025-07-18',
      담당자: '최은수'
    },
    {
      설비코드: 'EQ-002',
      설비명: '직각 왕복 판톱',
      설비유형: '재단공정',
      설비상태: '가동',
      비가동사유: '-',
      점검완료일: '2025-01-15 17:00:53',
      다음점검일: '2025-07-18',
      담당자: '이동섭'
    },
    {
      설비코드: 'EQ-003',
      설비명: 'CNC조각기',
      설비유형: '재단공정',
      설비상태: '가동',
      비가동사유: '-',
      점검완료일: '2025-01-15 17:00:53',
      다음점검일: '2025-07-18',
      담당자: '정경준'
    }
  ]
});

/*  공정 조회 모달  */
import MoDal from '@/views/common/NewModal.vue';

const modalRef = ref(null);
const modalTitle = ref('');
const modalRowData = ref([]);
const modalColDefs = ref([]);

const ColDefs = [
  { field: '공정코드', headerName: '공정코드', flex: 1 },
  { field: '공정명', headerName: '공정명', flex: 1 },
  { field: '설비유형', headerName: '설비유형', flex: 1 },
  { field: '등록일자', headerName: '등록일자', flex: 1, type: 'date' }
];

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

// 모달 확인
const modalConfirm = (selectedRow) => {
  if (!selectedRow) return;
  productKeyword.value = selectedRow.공정코드 || selectedRow.공정명 || '';
  searchProducts();
};
</script>
