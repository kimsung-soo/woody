<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="설비 점검관리 페이지">
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

    <ag-grid-vue
      style="height: 260px"
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

    <!-- 공정 조회 모달 -->
    <MoDal ref="modalRef" :title="modalTitle" :rowData="modalRowData" :colDefs="modalColDefs" @confirm="modalConfirm" />

    <!-- 상세입력 -->
    <v-card v-if="form.code" class="mt-6 pa-4 rounded-xl elevation-1 checker-card">
      <h3>점검 처리 입력</h3>
      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field label="설비코드" v-model="form.code" dense outlined readonly />
          <v-text-field label="설비명" v-model="form.name" dense outlined readonly />
          <v-text-field label="점검내역" v-model="form.inspectNote" dense outlined />
          <v-text-field label="담당자" v-model="form.manager" dense outlined readonly />

          <v-text-field label="부적합 사유" v-model="form.ngReason" dense outlined :disabled="form.fit !== '부적합'" />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field label="비가동 시작일" v-model="form.downStart" dense outlined readonly />
          <v-text-field label="점검 완료일" v-model="form.doneAt" dense outlined readonly />
          <v-text-field label="다음 점검일" v-model="form.nextAt" type="date" dense outlined />

          <div class="mt-2">
            <v-label class="mb-2 d-block">적합 여부</v-label>
            <v-radio-group v-model="form.fit" inline density="compact">
              <v-radio label="적합" value="적합" />
              <v-radio label="부적합" value="부적합" />
            </v-radio-group>
          </div>

          <div class="text-right mt-6">
            <v-btn color="primary" @click="completeInspection">점검완료</v-btn>
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

const page = ref({ title: '설비 점검관리' });
const breadcrumbs = shallowRef([
  { title: '설비', disabled: true, href: '#' },
  { title: '점검관리', disabled: false, href: '#' }
]);

const productKeyword = ref('');
const processCode = ref('');
const gridApi = ref(null);
const onGridReady = (e) => (gridApi.value = e.api);

const columnDefs = ref([
  { field: '설비코드', flex: 1 },
  { field: '설비명', flex: 1 },
  { field: '설비유형', flex: 1 },
  { field: '설비상태', flex: 1 },
  { field: '비가동사유', flex: 1 },
  { field: '비가동시작시간', flex: 1 },
  { field: '담당자', flex: 1 }
]);
const defaultColDef = { editable: false, sortable: true, resizable: true };

const rows = ref([
  {
    설비코드: 'EQ007',
    설비명: '융착기',
    설비유형: '가공설비',
    설비상태: '비가동',
    비가동사유: '점검',
    비가동시작시간: '2025-07-30 10:00:55',
    담당자: '김성수'
  },
  {
    설비코드: 'EQ003',
    설비명: 'CNC조각기',
    설비유형: '재단설비',
    설비상태: '비가동',
    비가동사유: '점검',
    비가동시작시간: '2025-07-28 14:12:30',
    담당자: '이동섭'
  }
]);

const form = reactive({
  code: '',
  name: '',
  type: '',
  manager: '',
  downStart: '',
  doneAt: '',
  nextAt: '',
  inspectNote: '',
  fit: '',
  ngReason: ''
});

const onPick = (e) => {
  const d = e.data;
  form.code = d.설비코드;
  form.name = d.설비명;
  form.type = d.설비유형;
  form.manager = d.담당자 || '';
  form.downStart = d.비가동시작시간 || now();
  form.doneAt = '';
  form.nextAt = '';
  form.inspectNote = '';
  form.fit = '';
  form.ngReason = '';
};

/* 점검완료 */
const completeInspection = () => {
  if (!form.code) return alert('설비를 먼저 선택하세요.');
  if (!form.fit) return alert('적합 여부를 선택하세요.');
  if (form.fit === '부적합' && !form.ngReason.trim()) return alert('부적합 사유를 입력하세요.');

  form.doneAt = now();

  const row = rows.value.find((r) => r.설비코드 === form.code);
  if (row) {
    row.적합여부 = form.fit;
    row.다음점검일 = form.nextAt || '-';
  }
  gridApi.value?.refreshCells({ force: true });
  alert('점검이 완료되었습니다.');
};

function now() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/* ===== 공정 조회 모달 ===== */
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
};
</script>
