<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <UiParentCard title="거래처등록 및 조회">
    
    <div class="main-container">
      <div class="list-container">
        <h5>거래처등록</h5>
        <ag-grid-vue
          :rowData="rowData1"
          :columnDefs="colDefs1"
          :theme="quartz"
          style="height: 90px; width: 100%"
          @cell-value-changed="onCellValueChanged"
        >
          <!--  :defaultColDef="{ width: 150 }" 로 전체 width지정도가능-->
        </ag-grid-vue>

        <br /><br />
        <v-row justify="end">
           <v-btn color="primary" class="mr-6" @click="submitForm">등록</v-btn>
        </v-row>




        <h5>거래처목록</h5>
        <ag-grid-vue
          :rowData="rowData2"
          :columnDefs="colDefs2"
          :theme="quartz"
          style="height: 360px; width: 100%"
          @cell-value-changed="onCellValueChanged"
        >
        </ag-grid-vue>

        <div class="d-flex align-right mb-4">
         <v-text-field label="검색" v-model="searchKeyword" hide-details class="mr-2" style="max-width: 280px"></v-text-field>
         <v-btn color="darkText" @click="searchData">검색</v-btn>
        </div>

      </div>  
       <MoDal
      ref="modalRef"
      :title="modalTitle"
      :rowData="modalRowData"
      :colDefs="modalColDefs"
      @confirm="modalConfirm"
      />
    <div class="d-flex align-right mb-4">
     
     
  
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

const form = ref({ writer: '' }, { addDate: '' }, { bomVer: '' }, { bomCode: '' });
const selectedRowIndex = ref(null)


// 거래처등록테이블
const rowData1 = ref([
  { 거래처코드: '자동생성', 거래처유형: '', 사업자등록번호: '수기입력', 거래처명: '수기입력', 담당자: '수기입력', 대표자:'수기입력', 사용여부:'모달', 비고:'입력또는공란' }
]);

const colDefs1 = ref([
  { field: '거래처코드', flex: 1, editable: false },
  { field: '거래처유형', flex: 1,  cellClass: 'clickable-cell', headerClass: 'with-mag',  editable: false, 
  onCellClicked: (params) => { selectedRowIndex.value = params.node.rowIndex; openModal('거래처유형', materialRowData.value, materialColDefs) } },
  { field: '사업자등록번호', flex: 1, editable: true },
  { field: '거래처명', flex: 1, editable: true },
  { field: '담당자', flex: 1, editable: true },
  { field: '대표자', flex: 1, editable: true },
  { field: '사용여부', flex: 1, editable: false },
  { field: '비고', flex: 1, editable: true }

]);

// 거래처목록테이블
const rowSelection = ref({
  mode: 'multiRow'
});
const rowData2 = ref([
  { 거래처코드: '불러오기', 거래처유형: '불러오기', 사업자등록번호: '불러오기', 거래처명: '불러오기', 담당자: '불러오기', 사용여부:'불러오기', 비고:'입력또는공란', 상세보기:'돋보기모달' },
  { 거래처코드: '', 거래처유형: '', 사업자등록번호: '', 거래처명: '', 담당자: '', 사용여부:'', 비고:'', 상세보기:'' },
  { 거래처코드: '', 거래처유형: '', 사업자등록번호: '', 거래처명: '', 담당자: '', 사용여부:'', 비고:'', 상세보기:'' },
  { 거래처코드: '', 거래처유형: '', 사업자등록번호: '', 거래처명: '', 담당자: '', 사용여부:'', 비고:'', 상세보기:'' },
  { 거래처코드: '', 거래처유형: '', 사업자등록번호: '', 거래처명: '', 담당자: '', 사용여부:'', 비고:'', 상세보기:'' },
  { 거래처코드: '', 거래처유형: '', 사업자등록번호: '', 거래처명: '', 담당자: '', 사용여부:'', 비고:'', 상세보기:'' },
  { 거래처코드: '', 거래처유형: '', 사업자등록번호: '', 거래처명: '', 담당자: '', 사용여부:'', 비고:'', 상세보기:'' }
]);

const colDefs2 = ref([
  { field: '거래처코드', flex: 1, editable: false },
  { field: '거래처유형', flex: 1, editable: false,},
  { field: '사업자등록번호',flex: 1, editable: false },
  { field: '거래처명', flex: 1, editable: false },
  { field: '담당자', flex: 1, editable: false },
  { field: '사용여부', flex: 1, editable: false },
  { field: '비고', flex: 1, editable: false },
  { field: '상세보기', flex: 1, editable: false }
]);


const page = ref({ title: '거래처등록 및 조회' });
const breadcrumbs = shallowRef([
  {
    title: '거래처',
    disabled: true,
    href: '#'
  },
  {
    title: '거래처등록 및 조회',
    disabled: false,
    href: '#'
  }
]);

const onCellValueChanged = (event) => {
  console.log(event.value);
  console.log(rowData1.value);
};



// 모달
const modalRef = ref(null)
const modalTitle = ref('')
const modalRowData = ref([])
const modalColDefs = ref([])
const openModal = (title, rowData, colDefs) => {
  modalTitle.value = title
  modalRowData.value = rowData
  modalColDefs.value = colDefs
  modalRef.value?.open?.()
}
const modalConfirm = (selectedRow) => {
  if (selectedRowIndex.value == null) return
  const idx = selectedRowIndex.value
  rowData1.value = rowData1.value.map((row, i) =>
    i === idx ? { ...row, 거래처유형: selectedRow.거래처유형} : row
  )
  modalRef.value?.close?.()
}

// 모달창 내용
const materialColDefs = [
  { field: '거래처유형', headerName: '거래처유형', flex: 1 },

]
const materialRowData = ref([
  { 거래처유형: '고객사' },
  { 거래처유형: '공급사' },
  { 거래처유형: '외주업체' },
  { 거래처유형: '운송업체' },
  { 거래처유형: '폐기업체' },
 
])




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


.clickable-cell {
  cursor: pointer;
  text-decoration: underline;
}

/* 거래처유형 헤더 왼쪽에 돋보기 아이콘 */
:deep(.ag-header .with-mag .ag-header-cell-text)::before {
  content: "";
  display: inline-block;
  width: 16px; height: 16px;
  margin-right: 6px;
  background: url('/icons/magnify.svg') no-repeat center / contain;
  transform: translateY(2px);
}

</style>
