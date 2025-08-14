<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="설비 정보조회">
    <v-row class="mb-2 py-0">
      <v-col cols="12" class="d-flex align-center">
        <v-btn color="warning" variant="flat" @click="openModal('공정 조회', RowData, ColDefs)"> 공정 조회 </v-btn>
      </v-col>
    </v-row>

    <v-row class="mb-4 pt-0">
      <v-col cols="12" md="6">
        <v-text-field label="공정코드" v-model="processCode" readonly hide-details density="comfortable" variant="outlined" />
      </v-col>
    </v-row>

    <MoDal ref="modalRef" :title="modalTitle" :rowData="modalRowData" :colDefs="modalColDefs" @confirm="modalConfirm" />

    <!-- AG Grid -->
    <ag-grid-vue
      style="height: 420px; margin-top: 8px"
      :theme="quartz"
      :rowData="form.items"
      :columnDefs="columnDefs"
      :animateRows="true"
      :suppressClickEdit="true"
      @grid-ready="onGridReady"
    />
  </UiParentCard>
</template>

<script setup>
import { ref, reactive, shallowRef, onMounted } from 'vue';
import axios from 'axios';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

import { AgGridVue } from 'ag-grid-vue3';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
const quartz = themeQuartz;

const page = ref({ title: '설비 정보조회' });
const breadcrumbs = shallowRef([
  { title: '설비', disabled: true, href: '#' },
  { title: '전체 조회', disabled: false, href: '#' }
]);

const columnDefs = ref([
  { field: '공정코드', hide: true, filter: 'agTextColumnFilter' },
  { field: '설비코드', flex: 1 },
  { field: '설비명', flex: 1 },
  { field: '설비유형', flex: 1 },
  {
    field: '사용유무',
    flex: 1,
    cellStyle: (p) => {
      if (p.value == '사용') return { color: 'blue', fontWeight: 'bold' };
      if (p.value == '정지') return { color: 'red', fontWeight: 'bold' };
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

const gridApi = ref(null);
const gridColumnApi = ref(null);
const onGridReady = (e) => {
  gridApi.value = e.api;
  gridColumnApi.value = e.columnApi;

  if (processCode.value) applyProcessFilter(processCode.value);
};

const applyProcessFilter = (procCode) => {
  if (!gridApi.value) return;
  gridApi.value.setFilterModel({
    공정코드: { filterType: 'text', type: 'equals', filter: procCode }
  });
  gridApi.value.onFilterChanged();
};

const processCode = ref('');
const processName = ref('');

const form = reactive({
  items: []
});

const API_URL = 'http://localhost:3000/facility';

const fmtDate = (v) => (typeof v === 'string' ? v.slice(0, 10) : (v ?? ''));

const mapRow = (r) => ({
  공정코드: r.PR_ID ?? '',
  설비코드: r.FAC_ID ?? '',
  설비명: r.FAC_NAME ?? '',
  설비유형: r.FAC_TYPE ?? '',
  사용유무: (r.FAC_USE ?? 1) === 1 ? '사용' : '정지',
  제조사: r.FAC_COMPANY ?? '',
  설비제조일: fmtDate(r.FAC_MDATE),
  설비설치일: fmtDate(r.FAC_IDATE),
  점검주기일: r.FAC_CHECKDAY ?? '',
  고장유형: r.FAIL_TYPE ?? '-',
  담당자: r.MANAGER ?? ''
});

const fetchList = async () => {
  try {
    const res = await axios.get(API_URL);
    const list = Array.isArray(res?.data) ? res.data : [];
    form.items = list.map(mapRow);

    if (processCode.value) applyProcessFilter(processCode.value);
  } catch (e) {
    console.error('[facility list] error:', e);
    alert('설비 목록 조회 실패');
  }
};

onMounted(fetchList);

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
  processCode.value = selectedRow.공정코드 || '';
  processName.value = selectedRow.공정명 || '';
  if (selectedRow.공정코드) applyProcessFilter(selectedRow.공정코드);
};
</script>
