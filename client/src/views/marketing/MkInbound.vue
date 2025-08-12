<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <UiParentCard>
    <h5>입고 및 LOT생성</h5>
    <div class="main-container">
      <div class="list-container">
        <ag-grid-vue
          :rowData="rowData1"
          :columnDefs="colDefs1"
          :theme="quartz"
          style="height: 700px; width: 100%"
          @cell-value-changed="onCellValueChanged"
        >
          <!--  :defaultColDef="{ width: 150 }" 로 전체 width지정도가능-->
        </ag-grid-vue>
        <br /><br />
       <v-row justify="end">
          <v-btn color="primary" class="mr-6" @click="submitForm">LOT번호등록</v-btn>
        </v-row>
      </div>
    </div>
  </UiParentCard>
</template>

<script setup>
// 기존 스크립트 내용은 동일합니다.
import { ref, shallowRef } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { themeQuartz } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';
import UiParentCard from '@/components/shared/UiParentCard.vue';
// 모달 임포트
import MoDal from '../common/NewModal.vue'; // 수정된 부분: 모달 컴포넌트 임포트
const quartz = themeQuartz;

const form = ref({ writer: '' }, { addDate: '' });

// 제품 리스트
const rowData1 = ref([
  { 입고일자: '불러오기', 제품코드:'불러오기', 제품명:'불러오기', 수량:'입력', LOT번호:'불러오기' },
  { 입고일자: '', 제품코드:'', 제품명:'', 수량:'', LOT번호:'' },
  { 입고일자: '', 제품코드:'', 제품명:'', 수량:'', LOT번호:'' },
  { 입고일자: '', 제품코드:'', 제품명:'', 수량:'', LOT번호:'' },
  { 입고일자: '', 제품코드:'', 제품명:'', 수량:'', LOT번호:'' },
  { 입고일자: '', 제품코드:'', 제품명:'', 수량:'', LOT번호:'' },
  { 입고일자: '', 제품코드:'', 제품명:'', 수량:'', LOT번호:'' },
  { 입고일자: '', 제품코드:'', 제품명:'', 수량:'', LOT번호:'' },
  { 입고일자: '', 제품코드:'', 제품명:'', 수량:'', LOT번호:'' },
  { 입고일자: '', 제품코드:'', 제품명:'', 수량:'', LOT번호:'' },
  { 입고일자: '', 제품코드:'', 제품명:'', 수량:'', LOT번호:'' },
  { 입고일자: '', 제품코드:'', 제품명:'', 수량:'', LOT번호:'' }  
]);

const colDefs1 = ref([
  { field: '✅', width: 100, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', editable: true },
  { field: '번호', width: 200 },
  { field: '입고일자', width: 200 },
  { field: '제품코드', width: 200 },
  { field: '제품명', width: 200 },
  { field: '수량', width: 200 },
  { field: 'LOT번호', width: 200 }
]);


const page = ref({ title: '입고 및 LOT번호등록' });
const breadcrumbs = shallowRef([
  {
    title: '영업',
    disabled: true,
    href: '#'
  },
  {
    title: '제품 입출고',
    disabled: true,
    href: '#'
  },
  {
    title: '입고 및 LOT번호등록',
    disabled: false,
    href: '#'
  }
]);

const onCellValueChanged = (event) => {
  console.log(event.value);
  console.log(rowData1.value);
};

const submitForm = () => {
  // rowData1 배열에 새로운 행을 추가합니다.
  const newRow = {
    '✅': false,
    제품명: form.value.writer,
    model: 'new model', // 필요에 따라 기본값 설정
    price: 0, // 필요에 따라 기본값 설정
    등록일: form.value.addDate
  };
  rowData2.value.push(newRow);

  // 폼 데이터를 초기화합니다.
  resetForm();
};

// 폼 데이터를 초기화하는 함수
const resetForm = () => {
  form.value = {
    writer: '',
    addDate: ''
  };
};

//모달 value들
const modalRef = ref(null);
const modalTitle = ref('');
const modalRowData = ref([]);
const modalColDefs = ref([]);
const materialColDefs = [
  { field: '자재코드', headerName: '자재코드', flex: 2 },
  { field: '자재명', headerName: '자재명', flex: 2 },
  { field: '자재유형', headerName: '자재유형', flex: 2 },
  { field: '수량', headerName: '수량', flex: 1 },
  { field: '단위', headerName: '단위', flex: 1 }
];
const materialRowData = ref([
  { 자재코드: 'ABC-001', 자재명: '나사', 자재유형: '부자재', 수량: 100, 단위: 'EA' },
  { 자재코드: 'XYZ-002', 자재명: '강철판', 자재유형: '원자재', 수량: 10, 단위: 'KG' }
]);

//모달 열때 데이터값 자식컴포넌트로
const openModal = (title, rowData, colDefs) => {
  modalTitle.value = title;
  modalRowData.value = rowData;
  modalColDefs.value = colDefs;
  if (modalRef.value) {
    modalRef.value.open();
  }
};

// 모달에서 확인시 행추가
const modalConfirm = (selectedRow) => {
  console.log(selectedRow);
  rowData3.value.push(selectedRow);
};
</script>

<style scoped>
.main-container {
  display: flex;
  gap: 20px; /* 두 컨테이너 사이의 간격 */
  padding: 0 10px;
}

.list-container {
  flex: 1 1 50%; /* flex-grow: 1, flex-shrink: 1, flex-basis: 50% */
  min-width: 500px;
}




</style>
