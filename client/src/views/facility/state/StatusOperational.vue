<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="비가동/가동 관리 페이지">
    <!-- 공정 선택 -->
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

    <!-- 목록 -->
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

    <!-- 공정 조회 모달 -->
    <MoDal ref="modalRef" :title="modalTitle" :rowData="modalRowData" :colDefs="modalColDefs" @confirm="modalConfirm" />

    <!-- 상세 폼 -->
    <v-card v-if="form.code" class="mt-6 pa-4">
      <v-row dense>
        <!-- 좌측 -->
        <v-col cols="6" md="6">
          <v-text-field label="설비코드" v-model="form.code" dense outlined readonly />
          <v-text-field label="설비명" v-model="form.name" dense outlined readonly />
          <v-text-field label="설비유형" v-model="form.type" dense outlined readonly />
          <v-text-field label="비가동 시작일시" v-model="form.downStart" dense outlined readonly />
          <v-text-field class="mt-2" label="비가동 완료일시" v-model="form.downEnd" dense outlined readonly />
        </v-col>

        <!-- 우측 -->
        <v-col cols="6" md="6">
          <!-- 상태 선택 -->
          <v-label class="mb-1 d-block">상태 선택</v-label>
          <v-radio-group v-model="form.targetStatus" inline>
            <v-radio label="가동" value="가동" />
            <v-radio label="비가동" value="비가동" />
          </v-radio-group>

          <!-- 비가동 사유 -->
          <v-label class="mb-1 d-block">비가동 사유</v-label>
          <v-radio-group v-model="form.downReason" inline :disabled="form.targetStatus !== '비가동'">
            <v-radio label="고장" value="고장" />
            <v-radio label="점검" value="점검" />
          </v-radio-group>

          <!-- 고장 유형 -->
          <v-label class="mb-1 d-block">고장 유형</v-label>
          <v-radio-group v-model="form.errType" inline :disabled="form.targetStatus !== '비가동' || form.downReason !== '고장'">
            <v-radio label="전기 이상" value="전기 이상" />
            <v-radio label="기계 마모" value="기계 마모" />
            <v-radio label="센서 오류" value="센서 오류" />
            <v-radio label="소프트웨어 오류" value="소프트웨어 오류" />
            <v-radio label="기타" value="기타" />
          </v-radio-group>

          <div class="text-right mt-2">
            <v-btn color="error" :disabled="form.targetStatus !== '비가동'" @click="setDown"> 비가동 </v-btn>
            <v-btn class="ml-2" color="primary" :disabled="form.targetStatus !== '가동'" @click="setUp"> 가동 </v-btn>
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

const page = ref({ title: '비가동/가동 관리' });
const breadcrumbs = shallowRef([
  { title: '설비', disabled: true, href: '#' },
  { title: '비가동/가동 관리', disabled: false, href: '#' }
]);

const processCode = ref('');
const gridApi = ref(null);
const onGridReady = (e) => (gridApi.value = e.api);
const applyQuickFilter = () => gridApi.value?.setGridOption('quickFilterText', processCode.value || '');

const columnDefs = ref([
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

/* 데이터 (더미) */
const rows = ref([
  {
    설비코드: 'EQ001',
    설비명: '탁상 재단기',
    설비유형: '재단설비',
    설비상태: '가동',
    비가동사유: '-',
    고장유형: '-',
    비가동시작시간: '-',
    담당자: '최은수'
  },
  {
    설비코드: 'EQ002',
    설비명: '띠톱기계',
    설비유형: '재단설비',
    설비상태: '비가동',
    비가동사유: '고장',
    고장유형: '전기 이상',
    비가동시작시간: '2025-07-30 17:00:40',
    담당자: '이동섭'
  },
  {
    설비코드: 'EQ003',
    설비명: 'CNC 조각기',
    설비유형: '재단설비',
    설비상태: '비가동',
    비가동사유: '점검',
    고장유형: '-',
    비가동시작시간: '2025-07-31 18:00:35',
    담당자: '이동섭'
  }
]);

/* 폼 */
const form = reactive({
  code: '',
  name: '',
  type: '',
  targetStatus: '비가동',
  downReason: '',
  errType: '',
  downStart: '',
  downEnd: ''
});

/* 행 선택 */
const onPick = (e) => {
  const d = e.data;
  form.code = d.설비코드;
  form.name = d.설비명;
  form.type = d.설비유형;
  form.targetStatus = d.설비상태 === '비가동' ? '가동' : '비가동';
  form.downReason = d.비가동사유 !== '-' ? d.비가동사유 : '';
  form.errType = d.고장유형 !== '-' ? d.고장유형 : '';
  form.downStart = d.비가동시작시간 !== '-' ? d.비가동시작시간 : '';
  form.downEnd = '';
};

/* 상태 변경 */
const setDown = () => {
  if (form.targetStatus !== '비가동') return;
  if (!form.code) return;
  if (!form.downReason) return alert('비가동 사유를 선택하세요.');
  if (form.downReason === '고장' && !form.errType) return alert('고장 유형을 선택하세요.');
  if (!confirm('선택 설비를 비가동으로 변경할까요?')) return;

  const row = rows.value.find((r) => r.설비코드 === form.code);
  if (row) {
    row.설비상태 = '비가동';
    row.비가동사유 = form.downReason;
    row.고장유형 = form.downReason === '고장' ? form.errType : '-';
    row.비가동시작시간 = now();
    form.downStart = row.비가동시작시간;
    form.downEnd = '';
  }
  gridApi.value?.refreshCells({ force: true });
  alert('비가동으로 전환되었습니다.');
};

const setUp = () => {
  if (form.targetStatus !== '가동') return;
  if (!form.code) return;
  if (!confirm('비가동을 해제하고 가동으로 변경할까요?')) return;

  const row = rows.value.find((r) => r.설비코드 === form.code);
  if (row) {
    row.설비상태 = '가동';
    row.비가동사유 = '-';
    row.고장유형 = '-';
    form.downEnd = now();
    row.비가동시작시간 = '-';
  }
  gridApi.value?.refreshCells({ force: true });
  alert('가동으로 전환되었습니다.');
};

function now() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/* 모달 */
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
