<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <UiParentCard>
    <h5>제품목록</h5>
    <div class="main-container">
      <div class="list-container">
        <ag-grid-vue
          :rowData="rowData1"
          :columnDefs="colDefs1"
          :theme="quartz"
          style="height: 200px; width: 100%"
          @cell-value-changed="onCellValueChanged"
        >
          <!--  :defaultColDef="{ width: 150 }" 로 전체 width지정도가능-->
        </ag-grid-vue>
        <br />
        <h5>BOM목록</h5>
        <div class="btn-list">
          <v-row justify="end">
            <v-btn color="error" class="mr-2" @click="del">삭제</v-btn>
            <v-btn color="primary" class="mr-4" @click="add">등록</v-btn>
          </v-row>
        </div>
        <br />
        <ag-grid-vue
          :rowData="rowData2"
          :columnDefs="colDefs2"
          :theme="quartz"
          style="height: 200px; width: 100%"
          @cell-value-changed="onCellValueChanged"
        >
        </ag-grid-vue>
      </div>
      <div class="form-wrapper">
        <div class="add">
          <v-row class="mb-4">
            <v-col cols="6">
              <v-text-field label="작성자" v-model="form.writer" dense outlined />
            </v-col>

            <v-col cols="6">
              <v-text-field label="등록일자" v-model="form.addDate" type="date" dense outlined />
            </v-col>
            <v-row justify="end">
              <v-btn color="primary" class="mr-6" @click="submitForm">저장</v-btn>
            </v-row>
          </v-row>
        </div>
        <br />
        <h5>자재목록</h5>
        <v-btn color="warning" class="mr-2" @click="openModal('자재 조회', materialRowData, materialColDefs)" style="margin-bottom: 2rem"
          >자재 조회
        </v-btn>
        <MoDal ref="modalRef" :title="modalTitle" :rowData="modalRowData" :colDefs="modalColDefs" />
        <ag-grid-vue
          :rowData="rowData3"
          :columnDefs="colDefs3"
          :theme="quartz"
          style="height: 200px; width: 100%"
          @cell-value-changed="onCellValueChanged"
        >
        </ag-grid-vue>
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

//모달 value들
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

// **수정 3: rowData1 데이터 통일 및 빈 객체 삭제**
const rowData1 = ref([
  { 제품명: 'Tesla', model: 'Model Y', price: 64950, 등록일: '' },
  { 제품명: 'Ford', model: 'F-Series', price: 33850, 등록일: '' }
]);

const colDefs1 = ref([
  { field: '✅', width: 50, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', editable: true },
  { field: '제품명', editable: true, width: 100 },
  { field: 'model', width: 100 },
  { field: 'price', width: 100 },
  { field: '등록일', width: 110, editable: true }
]);

const rowData2 = ref([
  { 제품명: 'Tesla', model: 'Model Y', price: 64950, 등록일: '' },
  { 제품명: 'Ford', model: 'F-Series', price: 33850, 등록일: '' }
]);

const colDefs2 = ref([
  { field: '✅', width: 50, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', editable: true },
  { field: '제품명', editable: true, width: 100 },
  { field: 'model', width: 100 },
  { field: 'price', width: 100 },
  { field: '등록일', width: 100, editable: true, cellDataType: 'date' }
]);

const rowData3 = ref([
  { 자재코드: 'Tesla', 자재명: 'Model Y', 자재유형: '원자재', 수량: 1, 단위: 'EA' },
  { 자재코드: 'Ford', 자재명: 'F-Series', 자재유형: '부자재', 수량: 2, 단위: 'EA' }
]);

const colDefs3 = ref([
  { field: '✅', width: 50, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', editable: true },
  { field: '자재코드', editable: true, width: 100 },
  { field: '자재명', width: 100 },
  { field: '자재유형', width: 100 },
  { field: '수량', width: 70, editable: true },
  { field: '단위', width: 70, editable: true }
]);

const page = ref({ title: 'BOM관리' });
const breadcrumbs = shallowRef([
  {
    title: '기준정보',
    disabled: true,
    href: '#'
  },
  {
    title: 'BOM 관리',
    disabled: false,
    href: '#'
  }
]);

const onCellValueChanged = (event) => {
  console.log(event.value);
  console.log(rowData1.value);
};

const submitForm = () => {
  const newRow = {
    '✅': false,
    제품명: form.value.writer,
    model: 'new model', // 필요에 따라 기본값 설정
    price: 0, // 필요에 따라 기본값 설정
    등록일: form.value.addDate
  };

  // rowData1 배열에 새로운 행을 추가합니다.
  rowData1.value.push(newRow);

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
const openModal = (title, rowData, colDefs) => {
  modalTitle.value = title;
  modalRowData.value = rowData;
  modalColDefs.value = colDefs;
  if (modalRef.value) {
    modalRef.value.open();
  }
};
</script>

<style scoped>
.main-container {
  display: flex;
  gap: 20px; /* 목록과 폼 사이에 간격을 줍니다 */
  margin-right: 20;
}

.list-container {
  width: 500px; /* 남은 공간을 모두 차지하도록 합니다 */
}
.add {
  width: 500px;
}
.btn-list {
  margin-left: 20px;
}
</style>
