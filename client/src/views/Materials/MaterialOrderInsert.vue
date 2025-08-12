<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="자재발주서 등록">
    <v-btn color="warning" class="mr-2" @click="openModal('자재 조회', materialRowData, materialColDefs)" style="margin-bottom: 2rem">
      자재 조회
    </v-btn>
    <MoDal ref="modalRef" :title="modalTitle" :rowData="modalRowData" :colDefs="modalColDefs" />

    <v-row class="mb-4">
      <v-col cols="6">
        <v-text-field label="공급처" v-model="form.supplier" dense outlined />
      </v-col>
      <v-col cols="6">
        <v-text-field label="발행번호" v-model="form.issueNumber" :readonly="true" placeholder="발행번호" dense outlined />
      </v-col>
      <v-col cols="6">
        <v-text-field label="발주일자" v-model="form.orderDate" type="date" dense outlined />
      </v-col>
      <v-col cols="6">
        <v-text-field label="납기일자" v-model="form.dueDate" type="date" dense outlined />
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

    <!-- 총금액 / 담당자 -->
    <v-row class="mb-4 margin">
      <v-col cols="6">
        <v-text-field label="담당자" v-model="form.manager" outlined />
      </v-col>
    </v-row>

    <!-- 버튼 -->
    <v-row justify="end">
      <v-btn color="error" class="mr-2" @click="resetForm">초기화</v-btn>
      <v-btn color="primary" @click="submitForm">저장</v-btn>
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
  { 자재명: '합판', 자재코드: 'MLT-00123', 규격: 'SD400', 단위: 'EA', 단가: 1200000, 수량: 10, 비고: '' },
  { 자재명: '원목', 자재코드: 'MLT-00124', 규격: 'SD400', 단위: 'EA', 단가: 800000, 수량: 5, 비고: '' }
]);

const colDefs = ref([
  { field: '자재명', flex: 1 },
  { field: '자재코드', flex: 1 },
  { field: '자재유형', flex: 1 },
  { field: '규격', flex: 1 },
  { field: '단위', flex: 1 },
  { field: '수량', editable: true, flex: 1 },
  { field: '비고', editable: true, flex: 1 }
]);

// ----------------- 폼 입력 필드 (유지) -----------------
const form = reactive({
  supplier: '',
  issueNumber: '',
  orderDate: '',
  dueDate: '',
  manager: ''
});

// ----------------- 모달 (기본 정의) -----------------
const modalRef = ref(null);
const modalTitle = ref('');
const modalRowData = ref([]);
const modalColDefs = ref([]);

const materialColDefs = [
  { field: 'code', headerName: '자재코드', flex: 2 },
  { field: 'Name', headerName: '자재명', flex: 2 },
  { field: 'Type', headerName: '자재유형', flex: 2 },
  { field: 'Qty', headerName: '수량', flex: 1 },
  { field: 'unit', headerName: '단위', flex: 1 }
];
const materialRowData = ref([
  { code: 'ABC-001', Name: '나사', Type: '부자재', Qty: 100, unit: 'EA' },
  { code: 'XYZ-002', Name: '강철판', Type: '원자재', Qty: 10, unit: 'KG' }
]);

const openModal = (title, rowData, colDefs) => {
  modalTitle.value = title;
  modalRowData.value = rowData;
  modalColDefs.value = colDefs;
  if (modalRef.value) {
    modalRef.value.open();
  }
};

// ----------------- 리셋 / 제출 -----------------
function resetForm() {
  // 폼 필드 초기화
  form.supplier = '';
  form.issueNumber = '';
  form.orderDate = '';
  form.dueDate = '';
  form.manager = '';
  alert('초기화 되었습니다.');
}

function submitForm() {
  // 실제 제출 시에는 숫자/형식 검사 및 페이로드 변환 필요
  console.log('제출된 폼:', { form: { ...form }, items: rowData.value });
  alert('폼 제출 성공');
}

// 페이지/브레드크럼
const page = ref({ title: '자재발주서' });
const breadcrumbs = shallowRef([
  { title: '자재', disabled: true, href: '#' },
  { title: '자재발주서 등록', disabled: false, href: '#' }
]);
</script>

<style scoped>
.margin {
  margin-top: 2.5rem;
}
</style>
