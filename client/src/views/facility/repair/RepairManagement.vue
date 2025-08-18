<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="설비 수리관리">
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

    <ag-grid-vue
      style="height: 240px"
      :theme="quartz"
      :rowData="rows"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :animateRows="true"
      :suppressClickEdit="true"
      rowSelection="single"
      @grid-ready="onGridReady"
      @row-clicked="onPick"
    />

    <MoDal ref="modalRef" :title="modalTitle" :rowData="modalRowData" :colDefs="modalColDefs" @confirm="modalConfirm" />

    <v-card v-if="form.code" class="mt-6 pa-4">
      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field label="설비코드" v-model="form.code" dense outlined readonly />
          <v-text-field label="설비명" v-model="form.name" dense outlined readonly />
          <v-text-field label="설비유형" v-model="form.type" dense outlined readonly />
          <v-text-field label="고장유형" v-model="form.err" dense outlined readonly />
          <v-text-field label="수리내역" v-model="form.note" dense outlined />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field label="비가동 시작일" v-model="form.repairStart" dense outlined readonly />
          <v-text-field label="수리 완료일" v-model="form.repairEnd" dense outlined readonly />
          <v-text-field label="담당자" v-model="form.manager" dense outlined readonly />
          <v-text-field label="비고" v-model="form.remark" dense outlined />
          <div class="text-right mt-2">
            <v-btn color="primary" @click="completeRepair">수리완료</v-btn>
          </div>
        </v-col>
      </v-row>
    </v-card>
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

const page = ref({ title: '설비 수리관리' });
const breadcrumbs = shallowRef([
  { title: '설비', disabled: true, href: '#' },
  { title: '수리관리', disabled: false, href: '#' }
]);

/* 공정코드 */
const processCode = ref('');
const gridApi = ref(null);
const onGridReady = (e) => (gridApi.value = e.api);
const applyProcessFilter = (procCode) => {
  if (!gridApi.value) return;
  gridApi.value.setFilterModel({
    공정코드: { filterType: 'text', type: 'equals', filter: procCode || '' }
  });
  gridApi.value.onFilterChanged();
};

/* 컬럼 정의 */
const columnDefs = ref([
  { field: '공정코드', hide: true, filter: 'agTextColumnFilter' },
  { field: '설비코드', flex: 1 },
  { field: '설비명', flex: 1 },
  { field: '설비유형', flex: 1 },
  { field: '설비상태', flex: 1 },
  { field: '비가동사유', flex: 1 },
  { field: '고장유형', flex: 1 },
  { field: '비가동시작시간', flex: 1 },
  { field: '담당자', flex: 1 }
]);
const defaultColDef = { editable: false, sortable: true, resizable: true };

/* 더미 데이터 */
const rows = ref([
  {
    공정코드: 'PRC-003',
    설비코드: 'EQ003',
    설비명: 'CNC조각기',
    설비유형: '재단설비',
    설비상태: '비가동',
    비가동사유: '고장',
    고장유형: '전기이상',
    비가동시작시간: '2025-07-30 17:00:40',
    담당자: '이동섭'
  },
  {
    공정코드: 'PRC-003',
    설비코드: 'EQ003',
    설비명: 'CNC조각기',
    설비유형: '재단설비',
    설비상태: '비가동',
    비가동사유: '고장',
    고장유형: '센서 오류',
    비가동시작시간: '2025-07-28 17:00:40',
    담당자: '이동섭'
  },
  {
    공정코드: 'PRC-003',
    설비코드: 'EQ003',
    설비명: 'CNC조각기',
    설비유형: '재단설비',
    설비상태: '비가동',
    비가동사유: '고장',
    고장유형: 'SW오류',
    비가동시작시간: '2025-07-15 15:42:40',
    담당자: '이동섭'
  }
]);

const form = reactive({
  code: '',
  name: '',
  type: '',
  err: '',
  manager: '',
  repairStart: '',
  repairEnd: '',
  note: '',
  remark: ''
});

const onPick = (e) => {
  const d = e.data;
  form.code = d.설비코드;
  form.name = d.설비명;
  form.type = d.설비유형;
  form.err = d.고장유형;
  form.manager = d.담당자 || '';
  form.repairStart = d.비가동시작시간 || now();
  form.repairEnd = '';
  form.note = '';
  form.remark = '';
};

const completeRepair = () => {
  if (!form.code) return;
  form.repairEnd = now();

  const row = rows.value.find((r) => r.설비코드 === form.code);
  if (row) {
    row.비가동사유 = '-';
    row.고장유형 = '-';
  }
  gridApi.value?.refreshCells({ force: true });
  alert('수리 완료 되었습니다.');
};

function now() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/* 공정 조회 모달  */
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

const modalConfirm = (selectedRow) => {
  if (!selectedRow) return;
  processCode.value = selectedRow.공정코드 || '';
  applyProcessFilter(processCode.value);
};
</script>
