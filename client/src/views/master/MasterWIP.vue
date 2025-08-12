<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <UiParentCard title="재공품 목록">
    <div class="d-flex align-center mb-4">
      <v-text-field label="재공품 검색" v-model="searchKeyword" hide-details class="mr-2" style="max-width: 280px"></v-text-field>
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
              <v-text-field label="재공품코드" v-model="form.wipCode" dense outlined />
            </v-col>
            <v-col cols="6">
              <v-text-field label="재공품명" v-model="form.wipName" dense outlined />
            </v-col>
            <v-col cols="6">
              <v-text-field label="작성자" v-model="form.writer" dense outlined />
            </v-col>
            <v-col cols="6">
              <v-text-field label="등록일자" v-model="form.date" type="date" dense outlined />
            </v-col>
            <v-col cols="4">
              <v-text-field label="규격(가로)" v-model="form.horr" dense outlined />
            </v-col>
            <v-col cols="4">
              <v-text-field label="규격(세로)" v-model="form.vert" dense outlined />
            </v-col>
            <v-col cols="4">
              <v-text-field label="규격(폭)" v-model="form.height" dense outlined />
            </v-col>
            <v-col cols="4">
              <v-text-field label="단위" v-model="form.unit" dense outlined />
            </v-col>
            <v-col cols="4">
              <v-text-field label="재공품유형" v-model="form.type" dense outlined />
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
  { prdCode: '' }, //
  { prdName: '' },
  { writer: '' },
  { date: '' },
  { horr: '' },
  { vert: '' },
  { height: '' },
  { type: '' }
);

// 제품 리스트
const rowData1 = ref([
  { 재공품코드: 1, 재공품명: '이동섭', 재공품유형: '원목', 규격: '1000*400*720', 단위: 'EA', 입사일자: '2025-08-29' },
  { 재공품코드: 2, 재공품명: '김태완', 재공품유형: '원목', 규격: '1200*400*720', 단위: 'EA', 입사일자: '2025-07-29' },
  { 재공품코드: 3, 재공품명: '김성수', 재공품유형: '원목', 규격: '1100*400*720', 단위: 'EA', 입사일자: '2025-06-29' },
  { 재공품코드: 4, 재공품명: '정경준', 재공품유형: '합판', 규격: '660*400*720', 단위: 'EA', 입사일자: '2025-05-29' },
  { 재공품코드: 5, 재공품명: '최은수', 재공품유형: '합판', 규격: '700*400*720', 단위: 'EA', 입사일자: '2025-04-29' },
  { 재공품코드: 6, 재공품명: '제갈은경', 재공품유형: '합판', 규격: '200*400*720', 단위: 'EA', 입사일자: '2025-03-29' }
]);

const colDefs1 = ref([
  { field: '재공품코드', editable: true, flex: 1 },
  { field: '재공품명', flex: 1, editable: true },
  { field: '재공품유형', flex: 1, editable: true },
  { field: '규격', flex: 1.2, editable: true },
  { field: '단위', flex: 0.6, editable: true },
  { field: '작성자', flex: 0.7, editable: true },
  { field: '등록일자', flex: 1, editable: true }
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
  form.value.prdCode = event.data.제품코드;
  form.value.prdName = event.data.제품명;
  form.value.writer = event.data.작성자;
  form.value.date = event.data.등록일;
  const [horr, vert, height] = event.data.규격.split('*');
  form.value.horr = horr;
  form.value.vert = vert;
  form.value.height = height;
  form.value.unit = event.data.단위;
  form.value.type = event.data.제품유형;
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
