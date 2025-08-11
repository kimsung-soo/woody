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
        <br /><br />
        <h5>BOM목록</h5>
        <div class="btn-list">
          <v-row justify="end" class="mb-2 w-100">
            <v-btn color="error" class="mr-2" @click="del">삭제</v-btn>
            <v-btn color="primary" @click="add">등록</v-btn>
          </v-row>
        </div>
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
        <div class="btn-list">
          <v-row justify="end">
            <v-btn
              color="warning"
              class="mr-4"
              @click="openModal('자재 조회', materialRowData, materialColDefs)"
              style="margin-bottom: 2rem"
              >자재 조회
            </v-btn>
          </v-row>

          <MoDal ref="modalRef" :title="modalTitle" :rowData="modalRowData" :colDefs="modalColDefs" @confirm="modalConfirm" />
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
  { 제품명: 'Tesla', model: 'Model Y', price: 64950, 등록일: '' },
  { 제품명: 'Ford', model: 'F-Series', price: 33850, 등록일: '' }
]);

const colDefs1 = ref([
  { field: '✅', width: 50, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', editable: true },
  { field: '제품명', editable: true, width: 150 },
  { field: 'model', width: 150 },
  { field: 'price', width: 150 },
  { field: '등록일', width: 110, editable: true }
]);

// BOM 리스트
const rowData2 = ref([
  { 제품명: 'Tesla', model: 'Model Y', price: 64950, 등록일: '' },
  { 제품명: 'Ford', model: 'F-Series', price: 33850, 등록일: '' }
]);

const colDefs2 = ref([
  { field: '✅', width: 50, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', editable: true },
  { field: '제품명', editable: true, width: 100 },
  { field: 'model', width: 100 },
  { field: 'price', width: 100 },
  { field: '등록일', width: 100, editable: true }
]);

// 자재 리스트
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
  min-width: 400px;
}

.form-wrapper {
  flex: 1 1 50%; /* list-container와 동일하게 공간을 차지 */
  min-width: 400px;
}

/* 아래는 필요에 따라 수정 */
.add {
  /* 이 컨테이너는 부모인 .form-wrapper의 너비를 따릅니다. */
}

.btn-list {
  /* 이 컨테이너도 부모의 너비를 따릅니다. */
}
</style>
