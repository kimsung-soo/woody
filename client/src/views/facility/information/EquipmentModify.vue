<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="설비 정보 수정 페이지">
    <v-row align="center" class="mb-4">
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

    <!-- ag grid -->
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

    <!-- 공정 조회 모달  -->
    <MoDal ref="modalRef" :title="modalTitle" :rowData="modalRowData" :colDefs="modalColDefs" @confirm="modalConfirm" />

    <v-card v-if="form.code" class="mt-6 pa-4">
      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field label="설비코드" v-model="form.code" dense outlined />
          <v-text-field label="설비명" v-model="form.name" dense outlined />
          <v-text-field label="설비유형" v-model="form.type" dense outlined />
          <v-text-field label="사용유무" v-model="form.useYn" dense outlined />
          <v-text-field label="제조사" v-model="form.maker" dense outlined />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field label="설비등록일" v-model="form.registeredDate" dense outlined />
          <v-text-field label="설비설치일" v-model="form.installDate" dense outlined />
          <v-text-field label="담당자" v-model="form.manager" dense outlined />
          <v-text-field label="비고" v-model="form.note" dense outlined />
          <div class="text-right mt-2">
            <v-btn color="success" @click="saveEdit">수정</v-btn>
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

const page = ref({ title: '설비 정보 수정' });
const breadcrumbs = shallowRef([
  { title: '설비', disabled: true, href: '#' },
  { title: '정보 수정', disabled: false, href: '#' }
]);

/* 검색어 퀵필터 */
const processCode = ref('');
const gridApi = ref(null);
const onGridReady = (e) => (gridApi.value = e.api);
const applyQuickFilter = () => {
  gridApi.value?.setGridOption('quickFilterText', processCode.value || '');
};

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
  { field: '설비등록일', flex: 1 },
  { field: '설비설치일', flex: 1 },
  { field: '담당자', flex: 1 }
]);
const defaultColDef = { editable: false, sortable: true, resizable: true };

/* 더미 데이터 */
const rows = ref([
  {
    설비코드: 'EQ001',
    설비명: '재단기 A',
    설비유형: '재단설비',
    사용유무: '사용',
    제조사: 'A사',
    설비등록일: '2024-03-26',
    설비설치일: '2024-03-22',
    담당자: '최은수'
  },
  {
    설비코드: 'EQ002',
    설비명: '띠톱기계',
    설비유형: '재단설비',
    사용유무: '정지',
    제조사: 'B사',
    설비등록일: '2023-11-15',
    설비설치일: '2023-11-02',
    담당자: '이동섭'
  },
  {
    설비코드: 'EQ003',
    설비명: 'CNC조각기',
    설비유형: '재단설비',
    사용유무: '사용',
    제조사: 'B사',
    설비등록일: '2023-11-15',
    설비설치일: '2023-11-02',
    담당자: '정경준'
  }
]);

const form = reactive({
  code: '',
  name: '',
  type: '',
  useYn: '',
  manufacturer: '',
  registeredAt: '',
  installedAt: '',
  manager: '',
  remark: ''
});

const onPick = (e) => {
  const d = e.data;
  form.code = d.설비코드;
  form.name = d.설비명;
  form.type = d.설비유형;
  form.useYn = d.사용유무 || '';
  form.manufacturer = d.제조사 || '';
  form.registeredAt = d.설비등록일 || '';
  form.installedAt = d.설비설치일 || '';
  form.manager = d.담당자 || '';
  form.remark = '';
};

const saveEdit = () => {
  if (!form.code) return;
  const row = rows.value.find((r) => r.설비코드 === form.code);
  if (row) {
    row.설비명 = form.name;
    row.설비유형 = form.type;
    row.사용유무 = form.useYn;
    row.제조사 = form.manufacturer;
    row.설비등록일 = form.registeredAt;
    row.설비설치일 = form.installedAt;
    row.담당자 = form.manager;
    gridApi.value?.refreshCells({ force: true });
  }
  alert('수정이 저장되었습니다.');
};

/* 공정 조회 모달 */
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
  processCode.value = selectedRow.공정코드 || selectedRow.공정명 || '';
  applyQuickFilter();
};
</script>
