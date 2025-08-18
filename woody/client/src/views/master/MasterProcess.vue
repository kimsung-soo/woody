<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <UiParentCard title="공정 목록">
    <div class="d-flex align-center mb-4">
      <v-text-field label="공정 검색" v-model="searchKeyword" hide-details class="mr-2" style="max-width: 280px"></v-text-field>
      <v-btn color="darkText" @click="searchData">검색</v-btn>
      <v-row justify="end" class="mr-3">
        <v-btn color="error" class="mr-1" @click="del">삭제</v-btn>
      </v-row>
    </div>
    <div class="main-container">
      <div class="list-container">
        <ag-grid-vue
          :rowData="rowData1"
          :columnDefs="colDefs1"
          :theme="quartz"
          style="height: 500px; width: 100%"
          @cell-value-changed="onCellValueChanged"
          :rowSelection="rowSelection"
          @rowClicked="onRowClicked"
        >
          <!--  :defaultColDef="{ width: 150 }" 로 전체 width지정도가능-->
        </ag-grid-vue>
      </div>
      <div class="form-wrapper">
        <div class="add">
          <v-row class="mb-4">
            <v-col cols="6">
              <v-text-field label="공정코드" v-model="form.prcCode" dense outlined />
            </v-col>
            <v-col cols="6">
              <v-text-field label="공정명" v-model="form.prcName" dense outlined />
            </v-col>
            <v-col cols="6">
              <v-text-field label="작성자" v-model="form.writer" dense outlined />
            </v-col>
            <v-col cols="6">
              <v-text-field label="등록일자" v-model="form.date" type="date" dense outlined />
            </v-col>
            <v-col cols="6">
              <v-text-field label="설비 유형" v-model="form.type" dense outlined />
            </v-col>
            <v-col cols="4"> </v-col>
            <v-col cols="12">
              <v-text-field label="비고" v-model="form.addr" dense outlined />
            </v-col>

            <v-row justify="center">
              <v-btn color="error" class="mr-3" @click="resetForm">초기화</v-btn>
              <v-btn color="primary" class="mr-6" @click="submitForm">저장</v-btn>
            </v-row>
          </v-row>
        </div>
        <br />
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

const quartz = themeQuartz;
const rowSelection = ref({
  mode: 'multiRow'
});
const form = ref(
  { prcCode: '' }, //
  { prcName: '' },
  { writer: '' },
  { date: '' },
  { type: '' }
);

// 제품 리스트
const rowData1 = ref([
  { 공정코드: 1, 공정명: '재단공정', 설비유형: '절단기', 작성자: '이동섭', 등록일자: '2025-08-29' },
  { 공정코드: 2, 공정명: '가공공정', 설비유형: '가공기', 작성자: '김태완', 등록일자: '2025-07-29' },
  { 공정코드: 3, 공정명: '연마공정', 설비유형: '연마기', 작성자: '김성수', 등록일자: '2025-06-29' },
  { 공정코드: 4, 공정명: '재단공정', 설비유형: '절단기', 작성자: '정경준', 등록일자: '2025-05-29' },
  { 공정코드: 5, 공정명: '도장공정', 설비유형: '도장기', 작성자: '최은수', 등록일자: '2025-04-29' },
  { 공정코드: 6, 공정명: '조립공정', 설비유형: '조립기', 작성자: '제갈은경', 등록일자: '2025-03-29' }
]);

const colDefs1 = ref([
  { field: '공정코드', editable: true, width: 140 },
  { field: '공정명', width: 140, editable: true },
  { field: '설비유형', width: 140, editable: true },
  { field: '작성자', width: 130, editable: true },
  { field: '등록일자', width: 130, editable: true }
]);

const page = ref({ title: '사원 관리' });
const breadcrumbs = shallowRef([
  {
    title: '기준정보',
    disabled: true,
    href: '#'
  },
  {
    title: '사원 관리',
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
  form.value.prcCode = event.data.공정코드;
  form.value.prcName = event.data.공정명;
  form.value.writer = event.data.작성자;
  form.value.date = event.data.등록일;
  form.value.type = event.data.설비유형;
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
