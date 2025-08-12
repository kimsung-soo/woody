<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="수리 내역">
    <v-row align="center" class="mb-2">
      <v-col cols="12" md="6" class="d-flex justify-start">
        <v-text-field
          v-model.trim="productKeyword"
          placeholder="설비선택"
          hide-details
          density="compact"
          variant="outlined"
          style="max-width: 280px"
        />

        <v-btn class="ml-2" color="darkText" @click="openModal('설비 조회', RowData, ColDefs)"> 검색 </v-btn>
      </v-col>
    </v-row>

    <!-- 설비 조회 모달 -->
    <MoDal ref="modalRef" :title="modalTitle" :rowData="modalRowData" :colDefs="modalColDefs" @confirm="modalConfirm" />

    <!-- AG Grid-->
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
  { field: '고장유형', flex: 1 },
  { field: '비가동시작일', flex: 1.5 },
  { field: '수리완료일', flex: 1.5 },
  { field: '수리내역', flex: 1.5 },
  { field: '담당자', flex: 1 },
  { field: '비고', flex: 2 }
]);

const productKeyword = ref('');
const gridApi = ref(null);
const onGridReady = (e) => {
  gridApi.value = e.api;
};
const searchProducts = () => {
  gridApi.value?.setGridOption('quickFilterText', productKeyword.value || '');
};

/*  더미 데이터 */
const form = reactive({
  items: [
    {
      설비코드: 'EQ-001',
      설비명: '띠톱 기계',
      설비유형: '재단설비',
      고장유형: '전기오류',
      비가동시작일: '2025-07-01 17:00:40',
      수리완료일: '2025-07-02 17:00:25',
      수리내역: '부품교체',
      담당자: '최은수',
      비고: '-'
    },
    {
      설비코드: 'EQ-001',
      설비명: '띠톱 기계',
      설비유형: '재단설비',
      고장유형: '모터 고장',
      비가동시작일: '2025-07-05 09:15:20',
      수리완료일: '2025-07-06 15:40:10',
      수리내역: '모터 교체',
      담당자: '최은수',
      비고: '정기 점검 시 교체'
    },
    {
      설비코드: 'EQ-001',
      설비명: '띠톱 기계',
      설비유형: '재단설비',
      고장유형: '소프트웨어 오류',
      비가동시작일: '2025-07-08 14:22:55',
      수리완료일: '2025-07-08 18:30:00',
      수리내역: '소프트웨어 재설치',
      담당자: '최은수',
      비고: '-'
    },
    {
      설비코드: 'EQ-002',
      설비명: '직각 왕복 판톱',
      설비유형: '재단설비',
      고장유형: '베어링 마모',
      비가동시작일: '2025-07-10 08:05:00',
      수리완료일: '2025-07-11 10:25:15',
      수리내역: '베어링 교체',
      담당자: '최은수',
      비고: '다음 점검 시 부품 예비 확보'
    },
    {
      설비코드: 'EQ-003',
      설비명: 'CNC조각기',
      설비유형: '재단설비',
      고장유형: '전원 불량',
      비가동시작일: '2025-07-12 16:45:35',
      수리완료일: '2025-07-13 11:50:45',
      수리내역: '전원 케이블 교체',
      담당자: '최은수',
      비고: '-'
    }
  ]
});

const defaultColDef = {
  editable: false,
  sortable: true,
  resizable: true
};

const page = ref({ title: '설비 수리 관리' });
const breadcrumbs = shallowRef([
  { title: '설비', disabled: true, href: '#' },
  { title: '수리 내역', disabled: false, href: '#' }
]);

/*  설비코드 모달  */
import MoDal from '@/views/common/NewModal.vue';

const modalRef = ref(null);
const modalTitle = ref('');
const modalRowData = ref([]);
const modalColDefs = ref([]);

const ColDefs = [
  { field: '설비코드', headerName: '설비코드', flex: 1 },
  { field: '설비명', headerName: '설비명', flex: 1 },
  { field: '설비유형', headerName: '설비유형', flex: 1 },
  { field: '담당자', headerName: '담당자', flex: 1 },
  { field: '설치일자', headerName: '설치일자', flex: 1 }
];

const RowData = ref([
  { 설비코드: 'EQ-001', 설비명: '띠톱 기계', 설비유형: '재단설비', 담당자: '최은수', 설치일자: '2025-02-18' },
  { 설비코드: 'EQ-002', 설비명: '직각 왕복 판톱', 설비유형: '재단설비', 담당자: '최은수', 설치일자: '2025-02-18' },
  { 설비코드: 'EQ-003', 설비명: 'CNC조각기', 설비유형: '재단설비', 담당자: '정경준', 설치일자: '2025-02-18' }
]);

const openModal = (title, rowData, colDefs) => {
  modalTitle.value = title;
  modalRowData.value = rowData;
  modalColDefs.value = colDefs;
  modalRef.value?.open();
};

const modalConfirm = (selectedRow) => {
  if (!selectedRow) return;
  productKeyword.value = selectedRow.설비코드 || '';
  searchProducts();
};
</script>
