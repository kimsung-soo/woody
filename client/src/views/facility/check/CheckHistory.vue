<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="점검 내역">
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

// AG Grid
import { AgGridVue } from 'ag-grid-vue3';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
const quartz = themeQuartz;

const columnDefs = ref([
  { field: '설비코드', flex: 1 },
  { field: '설비명', flex: 1 },
  { field: '점검내역', flex: 1 },
  { field: '점검시작일', flex: 1.5 },
  { field: '점검완료일', flex: 1.5 },
  { field: '다음점검일', flex: 1 },
  {
    field: '적합여부',
    flex: 1,
    cellStyle: (params) => {
      if (params.value == '적합') return { color: 'blue', fontWeight: 'bold' };
      if (params.value == '부적합') return { color: 'red', fontWeight: 'bold' };
      return null;
    }
  },
  { field: '부적합여부', flex: 1.5 },
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

const form = reactive({
  items: [
    {
      설비코드: 'EQ-001',
      설비명: '띠톱 기계',
      점검내역: '정기 점검 - 전기 계통',
      점검시작일: '2025-07-01 09:00',
      점검완료일: '2025-07-01 11:30',
      다음점검일: '2025-08-01',
      적합여부: '적합',
      부적합여부: '-',
      담당자: '최은수'
    },
    {
      설비코드: 'EQ-002',
      설비명: '프레스 기계',
      점검내역: '정기 점검 - 유압 시스템',
      점검시작일: '2025-07-03 14:00',
      점검완료일: '2025-07-03 15:20',
      다음점검일: '2025-08-03',
      적합여부: '적합',
      부적합여부: '-',
      담당자: '이동섭'
    },
    {
      설비코드: 'EQ-003',
      설비명: 'CNC 선반',
      점검내역: '베어링 마모 확인',
      점검시작일: '2025-07-05 10:00',
      점검완료일: '2025-07-05 12:00',
      다음점검일: '2025-08-05',
      적합여부: '부적합',
      부적합여부: '부품 교체 필요',
      담당자: '정경준'
    },
    {
      설비코드: 'EQ-004',
      설비명: '용접 로봇',
      점검내역: '센서 오작동 점검',
      점검시작일: '2025-07-08 09:30',
      점검완료일: '2025-07-08 10:15',
      다음점검일: '2025-08-08',
      적합여부: '적합',
      부적합여부: '-',
      담당자: '김태완'
    },
    {
      설비코드: 'EQ-005',
      설비명: '절단기',
      점검내역: '소프트웨어 업데이트',
      점검시작일: '2025-07-10 13:00',
      점검완료일: '2025-07-10 13:45',
      다음점검일: '2025-08-10',
      적합여부: '적합',
      부적합여부: '-',
      담당자: '제갈은경'
    }
  ]
});

const defaultColDef = {
  editable: false,
  sortable: true,
  resizable: true
};

const page = ref({ title: '설비 점검 관리' });
const breadcrumbs = shallowRef([
  { title: '설비', disabled: true, href: '#' },
  { title: '점검 내역', disabled: false, href: '#' }
]);

/* ===================== 설비코드 모달 ===================== */
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
  { 설비코드: 'EQ-002', 설비명: '프레스 기계', 설비유형: '가공설비', 담당자: '이동섭', 설치일자: '2025-02-20' },
  { 설비코드: 'EQ-003', 설비명: 'CNC 선반', 설비유형: '가공설비', 담당자: '정경준', 설치일자: '2025-03-05' },
  { 설비코드: 'EQ-004', 설비명: '용접 로봇', 설비유형: '조립설비', 담당자: '김태완', 설치일자: '2025-03-12' },
  { 설비코드: 'EQ-005', 설비명: '절단기', 설비유형: '재단설비', 담당자: '제갈은경', 설치일자: '2025-03-18' }
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
