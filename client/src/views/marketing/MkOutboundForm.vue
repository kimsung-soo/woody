<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <UiParentCard title="출하지시서등록">
    <div class="d-flex align-center mb-4">
      <v-text-field label="주문일자" type="date" v-model="searchKeyword" hide-details class="mr-2" style="max-width: 180px"></v-text-field>
      <v-text-field label="주문일자" type="date" v-model="searchKeyword" hide-details class="mr-2" style="max-width: 180px"></v-text-field>
      <v-btn color="darkText" @click="searchData">검색</v-btn>
    </div>
    <div class="main-container">
      <div class="list-container">
        <ag-grid-vue
          :rowData="rowData1"
          :columnDefs="colDefs1"
          :theme="quartz"
          style="height: 500px; width: 100%"
          @cell-value-changed="onCellValueChanged"
          @rowClicked="onRowClicked"
          :pagination="true"
          pagination-page-size="20"
        >
          <!--  :defaultColDef="{ width: 150 }" 로 전체 width지정도가능-->
        </ag-grid-vue>
      </div>
      <div class="form-wrapper">
        <div class="add">
          <v-row class="mb-4">
            <v-col cols="6">
              <v-text-field label="LOT번호" v-model="materialName" dense outlined readonly>
               <template #append-inner>
                <i
                 class="fa-solid fa-magnifying-glass"
                 style="cursor: pointer; font-size: large; margin-right: 0.5rem"
                 @click="openModal('LOT조회', materialRowData, materialColDefs)"
                ></i>
               </template>
              </v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field label="출하수량" v-model="form.areaNo" dense outlined />
            </v-col>
            <v-col cols="6">
              <v-text-field label="LOT번호" v-model="materialName" dense outlined readonly>
               <template #append-inner>
                <i
                 class="fa-solid fa-magnifying-glass"
                 style="cursor: pointer; font-size: large; margin-right: 0.5rem"
                 @click="openModal('LOT조회', materialRowData, materialColDefs)"
                ></i>
               </template>
              </v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field label="출하수량" v-model="form.qty" dense outlined />
            </v-col>
             <v-col cols="6">
              <v-text-field label="LOT번호" v-model="materialName" dense outlined readonly>
               <template #append-inner>
                <i
                 class="fa-solid fa-magnifying-glass"
                 style="cursor: pointer; font-size: large; margin-right: 0.5rem"
                 @click="openModal('LOT조회', materialRowData, materialColDefs)"
                ></i>
               </template>
              </v-text-field>              
            </v-col>
            <v-col cols="6">
              <v-text-field label="출하수량" v-model="form.areaNo" dense outlined />
            </v-col>
            <v-col cols="6">
              <v-text-field label="LOT번호" v-model="materialName" dense outlined readonly>
               <template #append-inner>
                <i
                 class="fa-solid fa-magnifying-glass"
                 style="cursor: pointer; font-size: large; margin-right: 0.5rem"
                 @click="openModal('LOT조회', materialRowData, materialColDefs)"
                ></i>
               </template>
              </v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field label="출하수량" v-model="form.qty" dense outlined />
            </v-col>
            <v-col cols="6">
              <v-text-field label="LOT번호" v-model="materialName" dense outlined readonly>
               <template #append-inner>
                <i
                 class="fa-solid fa-magnifying-glass"
                 style="cursor: pointer; font-size: large; margin-right: 0.5rem"
                 @click="openModal('LOT조회', materialRowData, materialColDefs)"
                ></i>
               </template>
              </v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field label="출하수량" v-model="form.carNo" dense outlined />
            </v-col>
            <v-row justify="center">
              <v-btn color="error" class="mr-3" @click="resetForm">초기화</v-btn>
              <v-btn color="primary" class="mr-6" @click="submitForm">등록</v-btn>
            </v-row>
          </v-row>
        </div>
        <br />
      </div>
    </div>
    <MoDal ref="modalRef" :title="modalTitle" :rowData="modalRowData" :colDefs="modalColDefs" @confirm="onModalConfirm" />
  </UiParentCard>
</template>

<script setup>
// 기존 스크립트 내용은 동일합니다.
import { ref, shallowRef } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { themeQuartz } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import MoDal from '../common/NewModal.vue';

const quartz = themeQuartz;

const form = ref(
  { prcCode: '' }, 
  { prcName: '' },
  { writer: '' },
  { date: '' },
  { type: '' }
);

// 모달
const modalRef = ref(null);
const modalTitle = ref('');
const modalRowData = ref([]);
const modalColDefs = ref([]);

const materialColDefs = [
  { field: '발행번호', headerName: '발행번호', flex: 1 },
  { field: '업체', headerName: '공급업체', flex: 1 },
  { field: '자재명', headerName: '자재명', flex: 1 },
  { field: '자재코드', headerName: '자재코드', flex: 1 },
  { field: '발주일자', headerName: '발주일자', flex: 1 },
  { field: '수량', headerName: '수량', flex: 1 },
  { field: '상태', headerName: '상태', flex: 1 }
];
const materialRowData = ref([
  { 발행번호: '20250808-001', 업체: '원목세상', 자재명: '원목', 자재코드: 'ZCB-558', 발주일자: '2025-08-08', 수량: 10, 상태: '완료' },
  { 발행번호: '20250808-001', 업체: '원목세상', 자재명: '원목', 자재코드: 'ZCB-558', 발주일자: '2025-08-08', 수량: 10, 상태: '완료' },
  { 발행번호: '20250808-001', 업체: '원목세상', 자재명: '원목', 자재코드: 'ZCB-558', 발주일자: '2025-08-08', 수량: 10, 상태: '완료' }
]);

const openModal = (title, rowData, colDefs) => {
  modalTitle.value = title;
  modalRowData.value = rowData;
  modalColDefs.value = colDefs;
  if (modalRef.value) {
    modalRef.value.open();
  }
};
//


// 주문서 리스트
const rowData1 = ref([
  { 주문일자: '2025-08-01' , 주문번호: 'ORD0801001', 제품코드: 'DSKWHITE', 제품명:'하얀책상' , 주문수량: '20', 납기일자: '2025-08-29' , 업체명:'공작초등' },
  { 주문일자: '2025-08-01' , 주문번호: 'ORD0801001', 제품코드: 'DSKWHITE', 제품명:'하얀책상' , 주문수량: '20', 납기일자: '2025-08-29' , 업체명:'공작초등' },
  { 주문일자: '2025-08-01' , 주문번호: 'ORD0801001', 제품코드: 'DSKWHITE', 제품명:'하얀책상' , 주문수량: '20', 납기일자: '2025-08-29' , 업체명:'공작초등' },
  { 주문일자: '2025-08-01' , 주문번호: 'ORD0801001', 제품코드: 'DSKWHITE', 제품명:'하얀책상' , 주문수량: '20', 납기일자: '2025-08-29' , 업체명:'공작초등' },
  { 주문일자: '2025-08-01' , 주문번호: 'ORD0801001', 제품코드: 'DSKWHITE', 제품명:'하얀책상' , 주문수량: '20', 납기일자: '2025-08-29' , 업체명:'공작초등' },
  { 주문일자: '2025-08-01' , 주문번호: 'ORD0801001', 제품코드: 'DSKWHITE', 제품명:'하얀책상' , 주문수량: '20', 납기일자: '2025-08-29' , 업체명:'공작초등' },
  { 주문일자: '2025-08-01' , 주문번호: 'ORD0801001', 제품코드: 'DSKWHITE', 제품명:'하얀책상' , 주문수량: '20', 납기일자: '2025-08-29' , 업체명:'공작초등' },

]);

const colDefs1 = ref([
  { field: '✅', flex: 1, cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor', editable: true },
  { field: '주문일자', editable: false, flex: 1 },
  { field: '주문번호', flex: 1, editable: false },
  { field: '제품코드', flex: 1, editable: false },
  { field: '제품명', flex: 1, editable: false },
  { field: '주문수량', flex: 1, editable: false },
  { field: '납기일자', flex: 1, editable: false },
  { field: '업체명', flex: 1, editable: false }
]);


//상단페이지경로
const page = ref({ title: '출하지시서등록' });
const breadcrumbs = shallowRef([
  {
    title: '영업',
    disabled: true,
    href: '#'
  },
  {
    title: '영업입출고',
    disabled: true,
    href: '#'
  },
  {
    title: '출하지시서등록',
    disabled: false,
    href: '#'
  }
]);

//cell 단위 수정
const onCellValueChanged = (event) => {
  console.log(event.value);
  console.log(rowData1.value);
};

// rowData1 배열에 새로운 행 추가
const submitForm = () => {
  const newRow = {
    제품코드: 'DK-112', // 필요에 따라 기본값 설정
    공정흐름도: form.value.diagram, // 필요에 따라 기본값 설정
    사원명: form.value.empName,
    등록일: form.value.addDate
  };
  rowData1.value.push(newRow);

  // 폼 데이터를 초기화합니다.
  resetForm();
};

// 폼 데이터를 초기화하는 함수
const resetForm = () => {
  form.value = {
    empName: '',
    addDate: '',
    empNo: '',
    diagram: ''
  };
};

// 행선택시 등록 폼으로
const onRowClicked = (event) => {
  form.value.carNo = event.data.차량번호;
  form.value.qty = event.data.등록일;
  form.value.company = event.data.설비유형;
  form.value.wrNo = '';
  form.value.areaNo = '';
  form.value.secCode = '';
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
.radioDiv {
  margin-left: 1rem;
}
</style>
