<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <UiParentCard title="제품 목록">
    <div class="d-flex align-center mb-4">
      <v-text-field label="제품명 검색" v-model="searchKeyword" hide-details class="mr-2" style="max-width: 280px"></v-text-field>
      <v-btn color="darkText" @click="searchData">검색</v-btn>
    </div>
    <div class="main-container">
      <div class="list-container">
        <ag-grid-vue
          :rowData="prdData"
          :columnDefs="prdDefs"
          :theme="quartz"
          style="height: 200px; width: 100%"
          @cell-value-changed="onCellValueChanged"
          @rowClicked="onRowClicked1"
        >
          <!--  :defaultColDef="{ width: 150 }" 로 전체 width지정도가능-->
        </ag-grid-vue>

        <br /><br />
        <!-- 수정 -->
        <div class="d-flex align-center mb-2">
          <h5 class="mb-0 mr-3">BOM목록</h5>
          <v-text-field label="제품명" v-model="form.prdName" hide-details readonly="true" style="max-width: 150px"></v-text-field>
        </div>
        <v-row justify="end" class="mb-2 w-100">
          <v-btn color="error" class="mr-1" @click="del">삭제</v-btn>
        </v-row>
        <ag-grid-vue
          :rowData="bomData"
          :columnDefs="bomDefs"
          :theme="quartz"
          style="height: 200px; width: 100%"
          @cell-value-changed="onCellValueChanged"
          :rowSelection="rowSelection"
          @rowClicked="onRowClicked2"
        >
        </ag-grid-vue>
      </div>
      <div class="form-wrapper">
        <div class="add">
          <v-row class="mb-4">
            <v-col cols="6">
              <v-text-field label="BOM코드" v-model="form.bomCode" dense outlined />
            </v-col>
            <v-col cols="6">
              <v-text-field label="BOM버젼" v-model="form.bomVer" dense outlined />
            </v-col>
            <v-col cols="6">
              <v-text-field label="작성자" v-model="form.writer" dense outlined />
            </v-col>

            <v-col cols="6">
              <v-text-field label="등록일자" v-model="form.addDate" type="date" dense outlined />
            </v-col>
            <v-row justify="center">
              <v-btn color="error" class="mr-3" @click="resetForm">초기화</v-btn>
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
            <v-btn color="error" class="mr-4" @click="delMat">삭제</v-btn>
          </v-row>

          <MoDal ref="modalRef" :title="modalTitle" :rowData="modalRowData" :colDefs="modalColDefs" @confirm="modalConfirm" />
          <ag-grid-vue
            :rowData="matData"
            :columnDefs="matDefts"
            :theme="quartz"
            style="height: 200px; width: 100%"
            @cell-value-changed="onCellValueChanged"
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
import { onMounted, ref, shallowRef } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { themeQuartz } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import axios from 'axios';
// 모달 임포트
import MoDal from '../common/NewModal.vue'; // 수정된 부분: 모달 컴포넌트 임포트
const quartz = themeQuartz;

const rowSelection = ref({
  mode: 'multiRow'
});
const form = ref({ writer: '', addDate: '', bomVer: '', bomCode: '', prdName: '' });

// 제품 리스트
const prdData = ref([]);

const prdDefs = ref([
  { field: '제품명', flex: 1 },
  { field: '제품코드', flex: 1 },
  { field: '제품유형', flex: 1 },
  { field: 'BOM코드', flex: 1 },
  { field: '작성자', flex: 1 },
  { field: '등록일', flex: 1 }
]);

// BOM 리스트
const bomData = ref([]);

const bomDefs = ref([
  { field: 'BOM코드', editable: true, flex: 1 },
  { field: '제품명', flex: 1 },
  { field: 'BOM버젼', flex: 1 },
  { field: '작성자', flex: 1 },
  { field: '등록일', flex: 1 }
]);

// 자재 리스트
const matData = ref([]);

const matDefts = ref([
  { field: '자재코드', editable: true, width: 150 },
  { field: '자재명', width: 150 },
  { field: '자재유형', width: 150 },
  { field: '소요수량', width: 110, editable: true },
  { field: '단위', width: 110, editable: true }
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

// 제품 조회
const prdList = async () => {
  const res = await axios.get('http://localhost:3000/BOMprdSelect');
  prdData.value = res.data.map((prd) => ({
    제품명: prd.PRD_NAME,
    제품코드: prd.PRD_CODE,
    제품유형: prd.PRD_TYPE,
    BOM코드: prd.BOM_CODE,
    작성자: prd.PRD_WRITER,
    등록일: prd.PRD_DATE.substring(0, 10)
  }));
};

onMounted(() => {
  prdList();
});

const onCellValueChanged = (event) => {
  console.log(event.value);
  console.log(prdData.value);
};

const submitForm = () => {
  // prdData 배열에 새로운 행을 추가합니다.
  const newRow = {
    '✅': false,
    BOM코드: form.value.bomCode,
    제품명: '하얀책상', // 필요에 따라 기본값 설정
    BOM버젼: form.value.bomVer, // 필요에 따라 기본값 설정
    작성자: form.value.writer,
    등록일: form.value.addDate
  };
  bomData.value.push(newRow);

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

const onRowClicked1 = async (e) => {
  //e.data.제품코드
  const bomList = { PRD_CODE: e.data.제품코드 };
  const res = await axios.post('http://localhost:3000/BOMbomSelect', bomList);
  bomData.value = res.data.map((prd) => ({
    BOM코드: prd.BOM_CODE,
    제품명: prd.PRD_NAME,
    BOM버젼: prd.BOM_VER,
    작성자: prd.BOM_WRITER,
    등록일: prd.BOM_RDATE.substring(0, 10)
  }));
  form.value.prdName = e.data.제품명;
};

// 행선택시 등록 폼으로
const onRowClicked2 = (event) => {
  form.value.bomCode = event.data.BOM코드;
  form.value.bomVer = event.data.BOM버젼;
  form.value.writer = event.data.작성자;
  form.value.addDate = event.data.등록일;
};
// db연결시 필요없는 삭제 함수 => delete문 실행후 select문 실행하기때문에
//BOM 버젼 삭제
const del = () => {
  const checkedRows = bomData.value.filter((row) => row['✅']);
  if (checkedRows.length == false) {
    alert('삭제항목을 선택하세요');
    return;
  }
  bomData.value = bomData.value.filter((row) => !row['✅']);
};
// 자재 목록 선택삭제
const delMat = () => {
  const checkedRows = matData.value.filter((row) => row['✅']);
  if (checkedRows.length == false) {
    alert('삭제항목을 선택하세요');
    return;
  }
  matData.value = matData.value.filter((row) => !row['✅']);
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
  { field: '수량', headerName: '수량', flex: 1, editable: true },
  { field: '단위', headerName: '단위', flex: 1, editable: true }
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
  matData.value.push(selectedRow);
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
