<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <UiParentCard title="제품 목록">
    <div class="d-flex align-center mb-4">
      <v-text-field label="제품 검색" v-model="searchKeyword" hide-details class="mr-2" style="max-width: 280px"></v-text-field>
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
          rowSelection="single"
          @rowClicked="onRowClicked"
        >
          <!--  :defaultColDef="{ width: 150 }" 로 전체 width지정도가능-->
        </ag-grid-vue>
      </div>
      <div class="form-wrapper">
        <div class="add">
          <v-row class="mb-4">
            <v-col cols="6">
              <v-text-field label="제품명" v-model="form.product" dense outlined />
            </v-col>
            <v-col cols="6">
              <v-text-field label="공정흐름도 코드" v-model="form.diagram" dense outlined />
            </v-col>
            <v-col cols="6">
              <v-text-field label="작성자" v-model="form.writer" dense outlined />
            </v-col>
            <v-col cols="6">
              <v-text-field label="등록일" v-model="form.addDate" type="date" dense outlined />
            </v-col>
            <v-row justify="center">
              <v-btn color="error" class="mr-3" @click="resetForm">초기화</v-btn>
              <v-btn color="primary" class="mr-6" @click="submitForm">저장</v-btn>
            </v-row>
          </v-row>
        </div>
        <br />
        <h5>공정목록</h5>
        <br />
        <div class="btn-list">
          <v-row justify="end">
            <v-btn
              color="warning"
              class="mr-4"
              @click="openModal('공정 조회', materialRowData, materialColDefs)"
              style="margin-bottom: 2rem"
              >공정 조회
            </v-btn>
            <v-btn color="error" class="mr-4" @click="del">삭제</v-btn>
          </v-row>

          <MoDal ref="modalRef" :title="modalTitle" :rowData="modalRowData" :colDefs="modalColDefs" @confirm="modalConfirm" />
          <ag-grid-vue
            :rowData="rowData3"
            :columnDefs="colDefs3"
            :theme="quartz"
            style="height: 250px; width: 100%"
            @cell-value-changed="onCellValueChanged"
            :rowDragManaged="true"
            :animateRows="true"
            :rowSelection="rowSelection"
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

const form = ref({ product: '' }, { diagram: '' }, { writer: '' }, { addDate: '' });

// 제품 리스트
const rowData1 = ref([
  { 제품명: 'Tesla', 제품코드: 'Model Y', 제품유형: '완제품', 공정흐름도: 'prc_010', 작성자: '김태완', 등록일: '2025-12-31' },
  { 제품명: 'Ford', 제품코드: 'F-Series', 제품유형: '완제품', 공정흐름도: 'prc_010', 작성자: '김태완', 등록일: '2025-12-31' },
  { 제품명: '빨간책상', 제품코드: 'Model Y', 제품유형: '완제품', 공정흐름도: 'prc_010', 작성자: '김태완', 등록일: '2025-12-31' },
  { 제품명: '하얀책상', 제품코드: 'Model Y', 제품유형: '완제품', 공정흐름도: 'prc_010', 작성자: '김태완', 등록일: '2025-12-31' },
  { 제품명: '멋진책상', 제품코드: 'Model Y', 제품유형: '완제품', 공정흐름도: 'prc_010', 작성자: '김태완', 등록일: '2025-12-31' },
  { 제품명: '지린책상', 제품코드: 'Model Y', 제품유형: '완제품', 공정흐름도: 'prc_010', 작성자: '김태완', 등록일: '2025-12-31' },
  { 제품명: 'Tesla', 제품코드: 'Model Y', 제품유형: '완제품', 공정흐름도: 'prc_010', 작성자: '김태완', 등록일: '2025-12-31' },
  { 제품명: 'Tesla', 제품코드: 'Model Y', 제품유형: '완제품', 공정흐름도: 'prc_010', 작성자: '김태완', 등록일: '2025-12-31' }
]);

const rowSelection = ref({
  mode: 'multiRow'
});
const colDefs1 = ref([
  { field: '제품명', editable: true, width: 120 },
  { field: '제품코드', width: 130 },
  { field: '제품유형', width: 130 },
  { field: '공정흐름도', width: 130 },
  { field: '작성자', width: 110, editable: true },
  { field: '등록일', width: 110, editable: true }
]);

// 공정 리스트
const rowData3 = ref([
  { 공정순서: 1, 공정코드: 'Tesla', 공정명: 'Model Y', 설비유형: '절단기' },
  { 공정순서: 2, 공정코드: 'Ford', 공정명: 'F-Series', 설비유형: '연마기' }
]);

const colDefs3 = ref([
  { field: '공정순서', type: Number, width: 130, rowDrag: true, editable: true },
  { field: '공정코드', editable: true, width: 180 },
  { field: '공정명', width: 180 },
  { field: '설비유형', width: 180, editable: true }
]);

const page = ref({ title: '공정흐름도 관리' });
const breadcrumbs = shallowRef([
  {
    title: '기준정보',
    disabled: true,
    href: '#'
  },
  {
    title: '공정흐름도 관리',
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
    제품명: form.value.product,
    제품코드: 'DK-112', // 필요에 따라 기본값 설정
    공정흐름도: form.value.diagram, // 필요에 따라 기본값 설정
    작성자: form.value.writer,
    등록일: form.value.addDate
  };
  rowData1.value.push(newRow);

  // 폼 데이터를 초기화합니다.
  resetForm();
};

// 폼 데이터를 초기화하는 함수
const resetForm = () => {
  form.value = {
    writer: '',
    addDate: '',
    product: '',
    diagram: ''
  };
};

// 행선택시 등록 폼으로
const onRowClicked = (event) => {
  form.value.product = event.data.제품명;
  form.value.diagram = event.data.공정흐름도;
  form.value.writer = event.data.작성자;
  form.value.addDate = event.data.등록일;
};
//BOM 버젼 삭제
const del = () => {
  const checkedRows = rowData3.value.filter((row) => row['✅']);
  if (checkedRows.length == false) {
    alert('삭제항목을 선택하세요');
    return;
  }
  rowData3.value = rowData3.value.filter((row) => !row['✅']);
};

//모달 value들
const modalRef = ref(null);
const modalTitle = ref('');
const modalRowData = ref([]);
const modalColDefs = ref([]);
const materialColDefs = [
  { field: '공정코드', headerName: '공정코드', flex: 1 },
  { field: '공정명', headerName: '공정명', flex: 1 },
  { field: '설비유형', headerName: '설비유형', flex: 1 },
  { field: '등록일자', headerName: '등록일자', flex: 1, type: 'date' }
];
const materialRowData = ref([
  { 공정코드: 'ABC-001', 공정명: '재단 공정', 설비유형: '절단기', 등록일자: '2025-12-11' },
  { 공정코드: 'XYZ-002', 공정명: '연마 공정', 설비유형: '연마기', 등록일자: '2025-12-11' }
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
  const maxOrder = rowData3.value.reduce((max, row) => {
    return row.공정순서 > max ? row.공정순서 : max;
  }, 0);

  // 선택한 행에 공정순서 할당 (기존 최대값 + 1)
  selectedRow.공정순서 = maxOrder + 1;
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
</style>
