<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="자재 입고">
    <v-row class="mb-4">
      <v-col cols="4">
        <v-text-field label="발행번호" v-model="form.issueNumber" dense outlined readonly />
      </v-col>
      <v-btn
        color="warning"
        class="mr-2 button"
        @click="openModal('자재발주서 조회', materialRowData, materialColDefs)"
        style="margin-bottom: 2rem"
      >
        자재 조회
      </v-btn>
      <MoDal ref="modalRef" :title="modalTitle" :rowData="modalRowData" :colDefs="modalColDefs" @confirm="onModalConfirm" />
    </v-row>
    <v-row class="mb-4">
      <v-col cols="6">
        <v-text-field label="입고일자" v-model="form.insertDate" type="date" dense outlined />
      </v-col>
      <v-col cols="6">
        <v-text-field label="업체명" v-model="form.name" dense outlined readonly />
      </v-col>
    </v-row>

    <ag-grid-vue
      :rowData="rowData"
      :columnDefs="colDefs"
      :theme="quartz"
      style="height: 200px; width: 100%"
      @cell-value-changed="onCellValueChanged"
      @grid-ready="onGridReady"
    >
    </ag-grid-vue>

    <v-row class="mb-4 margin">
      <v-col cols="6">
        <v-text-field label="담당자" v-model="form.manager" outlined />
      </v-col>
    </v-row>

    <!-- 버튼 -->
    <v-row justify="end">
      <v-btn color="error" class="mr-2" @click="resetForm">초기화</v-btn>
      <v-btn color="primary" @click="submitForm">등록</v-btn>
    </v-row>
  </UiParentCard>
</template>

<script setup>
import { ref, shallowRef, reactive } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { AgGridVue } from 'ag-grid-vue3';
import { themeQuartz } from 'ag-grid-community';
import MoDal from '../common/NewModal.vue';

const quartz = themeQuartz;

// ----------------- 그리드 데이터 (독립) -----------------
const rowData = ref([
  // 초기 샘플. 필요하면 빈 배열 [] 로 시작해도 됨.
  // { 자재명: '합판', 자재코드: 'MLT-00123', 규격: 'SD400', 단위: 'EA', 단가: 1200000, 수량: 10, 비고: '' },
  // { 자재명: '원목', 자재코드: 'MLT-00124', 규격: 'SD400', 단위: 'EA', 단가: 800000, 수량: 5, 비고: '' }
]);

const colDefs = ref([
  { field: '자재명', flex: 1 },
  { field: '자재코드', flex: 1 },
  { field: '규격', flex: 1 },
  { field: '단위', flex: 1 },
  { field: '자재유형', flex: 1 },
  { field: '발주수량', flex: 1 },
  { field: '입고수량', editable: true, flex: 1 }
]);

// ----------------- 폼 입력 필드 (유지) -----------------
const form = reactive({
  issueNumber: '',
  insertDate: '',
  name: '',
  manager: ''
});

// ----------------- AG Grid API (리셋에 사용) -----------------
const gridApi = ref(null);
const gridColumnApi = ref(null);

const onGridReady = (params) => {
  gridApi.value = params.api;
  gridColumnApi.value = params.columnApi;
};

// ----------------- 모달 (기본 정의) -----------------
const modalRef = ref(null);
const modalTitle = ref('');
const modalRowData = ref([]);
const modalColDefs = ref([]);

const materialColDefs = [
  { field: '발행번호', headerName: '발행번호', flex: 1.2 },
  { field: '업체', headerName: '공급업체', flex: 1 },
  { field: '자재명', headerName: '자재명', flex: 0.8 },
  { field: '자재코드', headerName: '자재코드', flex: 0.8 },
  { field: '규격', headerName: '규격', flex: 0.6 },
  { field: '발주일자', headerName: '발주일자', flex: 1 },
  { field: '수량', headerName: '수량', flex: 0.6 },
  { field: '상태', headerName: '상태', flex: 0.6 }
];
const materialRowData = ref([
  {
    발행번호: '20250808-001',
    업체: '원목세상',
    자재명: '원목',
    규격: 'mm',
    자재코드: 'ZCB-558',
    발주일자: '2025-08-08',
    수량: 10,
    상태: '완료'
  },
  {
    발행번호: '20250808-001',
    업체: '원목세상',
    자재명: '원목',
    규격: 'mm',
    자재코드: 'ZCB-558',
    발주일자: '2025-08-08',
    수량: 10,
    상태: '완료'
  }
]);

const openModal = (title, rowData, colDefs) => {
  modalTitle.value = title;
  modalRowData.value = rowData;
  modalColDefs.value = colDefs;
  if (modalRef.value) {
    modalRef.value.open();
  }
};

function onModalConfirm(selectedRow) {
  // 폼에 발행번호 / 업체명 반영
  form.issueNumber = selectedRow.발행번호 || '';
  form.name = selectedRow.업체 || '';

  const today = new Date();
  form.insertDate = today.toISOString().slice(0, 10);

  // 그리드 데이터에 추가
  rowData.value.push({
    자재명: selectedRow.자재명 || '',
    자재코드: selectedRow.자재코드 || '',
    규격: selectedRow.규격 || '',
    단위: selectedRow.단위 || 'EA',
    자재유형: selectedRow.자재유형 || '',
    발주수량: selectedRow.수량 || 0
  });
}

// ----------------- 리셋 / 제출 -----------------
function resetForm() {
  // 폼 필드 초기화
  form.issueNumber = '';
  form.insertDate = '';
  form.manager = '';
  alert('초기화 되었습니다.');
}

function submitForm() {
  // 실제 제출 시에는 숫자/형식 검사 및 페이로드 변환 필요
  console.log('제출된 폼:', { form: { ...form }, items: rowData.value });
  alert('폼 제출 성공');
}

// 페이지/브레드크럼
const page = ref({ title: '입고' });
const breadcrumbs = shallowRef([
  { title: '자재', disabled: true, href: '#' },
  { title: '입고 등록 ', disabled: false, href: '#' }
]);
</script>

<style scoped>
.margin {
  margin-top: 2.5rem;
}

.button {
  margin-top: 1rem;
  margin-left: 3rem;
}
</style>
