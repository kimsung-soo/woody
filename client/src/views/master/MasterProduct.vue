<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <UiParentCard>
    <h5>제품 목록</h5>
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
          style="height: 550px; width: 100%"
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
              <v-text-field label="사원번호" v-model="form.empNo" dense outlined />
            </v-col>
            <v-col cols="6">
              <v-text-field label="사원명" v-model="form.empName" dense outlined />
            </v-col>
            <v-col cols="6">
              <v-text-field label="연락처" v-model="form.phone" dense outlined />
            </v-col>
            <v-col cols="6">
              <v-text-field label="이메일" v-model="form.email" dense outlined />
            </v-col>
            <v-col cols="6">
              <v-text-field label="부서명" v-model="form.dept" dense outlined />
            </v-col>
            <v-col cols="6">
              <v-text-field label="직급" v-model="form.auth" dense outlined />
            </v-col>
            <v-col cols="12">
              <v-text-field label="주소" v-model="form.addr" dense outlined />
            </v-col>

            <v-col cols="6">
              <v-text-field label="입사일자" v-model="form.hireDate" type="date" dense outlined />
            </v-col>
            <v-col cols="6">
              <v-radio-group label="재직상태" v-model="form.status" dense outlined>
                <v-radio label="재직" value="재직"></v-radio>
                <v-radio label="퇴사" value="퇴사"></v-radio>
              </v-radio-group>
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

const form = ref(
  { empNo: '' }, //
  { phone: '' },
  { empName: '' },
  { hireDate: '' },
  { auth: '' },
  { dept: '' },
  { addr: '' },
  { status: '재직' }
);

// 제품 리스트
const rowData1 = ref([
  { 사원번호: 'Tesla', 사원명: 'Model Y', 부서: '완제품', 직급: 'prc_010', 재직상태: '재직', 입사일자: '2025-12-31' },
  { 사원번호: 'Ford', 사원명: 'F-Series', 부서: '완제품', 직급: 'prc_010', 재직상태: '재직', 입사일자: '2025-12-31' },
  { 사원번호: '빨간책상', 사원명: 'Model Y', 부서: '완제품', 직급: 'prc_010', 재직상태: '재직', 입사일자: '2025-12-31' },
  { 사원번호: '하얀책상', 사원명: 'Model Y', 부서: '완제품', 직급: 'prc_010', 재직상태: '재직', 입사일자: '2025-12-31' },
  { 사원번호: '멋진책상', 사원명: 'Model Y', 부서: '완제품', 직급: 'prc_010', 재직상태: '재직', 입사일자: '2025-12-31' },
  { 사원번호: '지린책상', 사원명: 'Model Y', 부서: '완제품', 직급: 'prc_010', 재직상태: '재직', 입사일자: '2025-12-31' },
  { 사원번호: 'Tesla', 사원명: 'Model Y', 부서: '완제품', 직급: 'prc_010', 재직상태: '재직', 입사일자: '2025-12-31' },
  { 사원번호: 'Tesla', 사원명: 'Model Y', 부서: '완제품', 직급: 'prc_010', 재직상태: '재직', 입사일자: '2025-12-31' }
]);

const colDefs1 = ref([
  { field: '사원번호', editable: true, width: 120 },
  { field: '사원명', width: 130 },
  { field: '부서', width: 130 },
  { field: '직급', width: 130 },
  { field: '입사일자', width: 110, editable: true },
  { field: '재직상태', width: 110, editable: true }
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
    사원번호: form.value.empNo,
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
  form.value.empNo = event.data.사원번호;
  form.value.empName = event.data.사원명;
  form.value.hireDate = event.data.입사일자;
  form.value.addr = event.data.주소;
  form.value.dept = event.data.부서;
  form.value.auth = event.data.직급;
  form.value.phone = event.data.연락처;
  form.value.email = event.data.이메일;
  form.value.status = event.data.재직상태;
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
