<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <UiParentCard title="재고 검색조건">
    <v-row class="mb-4">
      <v-col cols="3">
        <v-text-field label="자재명" v-model="materialName" placeholder="자재명" dense outlined readonly>
          <template #append-inner>
            <i
              class="fa-solid fa-magnifying-glass"
              style="cursor: pointer; font-size: large; margin-right: 0.5rem"
              @click="openModal('자재 조회', materialRowData, materialColDefs)"
            ></i>
          </template>
        </v-text-field>
      </v-col>
      <v-col cols="3">
        <v-text-field label="자재코드" v-model="materialCode" placeholder="자재코드" dense outlined readonly></v-text-field>
      </v-col>
      <v-col cols="3">
        <v-text-field label="담당자" v-model="manager" placeholder="담당자" dense outlined />
      </v-col>
      <v-col cols="3">
        <v-text-field label="창고코드" v-model="storageCode" placeholder="창고코드" dense outlined readonly>
          <template #append-inner>
            <i
              class="fa-solid fa-magnifying-glass"
              style="cursor: pointer; font-size: large; margin-right: 0.5rem"
              @click="openModal('창고코드 조회', materialRowData2, materialColDefs2)"
            ></i>
          </template>
        </v-text-field>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-btn color="error" class="mr-2" @click="inputReset">초기화</v-btn>
      <v-btn color="darkText" @click="fileSelect">검색</v-btn>
    </v-row>
  </UiParentCard>
  <div class="div"></div>
  <v-tabs v-model="tab" class="custom-tabs">
    <v-tab class="tab">원자재</v-tab>
    <v-tab class="tab">부자재</v-tab>
    <v-tab class="tab">소모품</v-tab>
    <v-tab class="tab">완제품</v-tab>
  </v-tabs>
  <UiParentCard title="재고 목록">
    <ag-grid-vue
      :rowData="rowData"
      :columnDefs="colDefs"
      :theme="quartz"
      style="height: 200px; width: 100%"
      @cell-value-changed="onCellValueChanged"
    >
    </ag-grid-vue>
    <MoDal ref="modalRef" :title="modalTitle" :rowData="modalRowData" :colDefs="modalColDefs" @confirm="onModalConfirm" />
  </UiParentCard>
</template>

<script setup>
import { ref, shallowRef, watch } from 'vue';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { AgGridVue } from 'ag-grid-vue3';
import { themeQuartz } from 'ag-grid-community';
import MoDal from '../common/NewModal.vue';
const quartz = themeQuartz;

// 모달 1
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

// 모달 2
const materialColDefs2 = [
  { field: '발행번호', headerName: '발행번호', flex: 1 },
  { field: '업체', headerName: '공급업체', flex: 1 },
  { field: '자재명', headerName: '자재명', flex: 1 },
  { field: '자재코드', headerName: '자재코드', flex: 1 },
  { field: '발주일자', headerName: '발주일자', flex: 1 },
  { field: '수량', headerName: '수량', flex: 1 },
  { field: '상태', headerName: '상태', flex: 1 }
];
const materialRowData2 = ref([
  { 발행번호: '20250808-001', 업체: '원목세상', 자재명: '원목', 자재코드: 'ZCB-558', 발주일자: '2025-08-08', 수량: 10, 상태: '완료' },
  { 발행번호: '20250808-001', 업체: '원목세상', 자재명: '원목', 자재코드: 'ZCB-558', 발주일자: '2025-08-08', 수량: 10, 상태: '완료' },
  { 발행번호: '20250808-001', 업체: '원목세상', 자재명: '원목', 자재코드: 'ZCB-558', 발주일자: '2025-08-08', 수량: 10, 상태: '완료' }
]);

const colDefs = ref([
  { field: 'LOT번호', flex: 2 },
  { field: '자재명', flex: 1 },
  { field: '자재코드', flex: 1 },
  { field: '규격', flex: 1 },
  { field: '단위', flex: 1 },
  { field: '창고코드', flex: 1.5 },
  { field: '수량', flex: 1 }
]);

const tab = ref(0); // 0번째 탭이 기본 선택 (원자재)

// 각 탭별 데이터 (예시)
const rawMaterialsData = [
  { LOT번호: 'ORD-20250808-001', 자재명: '원목', 자재코드: 'ZCB-558', 규격: 'SD400', 단위: 'EA', 창고코드: 'DEX-47', 수량: '1000' },
  { LOT번호: 'ORD-20250808-002', 자재명: '합판', 자재코드: 'ABC-123', 규격: 'SD300', 단위: 'EA', 창고코드: 'DEX-48', 수량: '500' }
];
const subMaterialsData = [
  { LOT번호: 'SUB-20250808-001', 자재명: '못', 자재코드: 'NAIL-001', 규격: '5cm', 단위: 'Box', 창고코드: 'SUB-01', 수량: '200' }
];
const consumablesData = [
  { LOT번호: 'CON-20250808-001', 자재명: '사포', 자재코드: 'SAND-003', 규격: '중', 단위: '장', 창고코드: 'CON-01', 수량: '100' }
];
const finishedGoodsData = [
  { LOT번호: 'FIN-20250808-001', 자재명: '의자', 자재코드: 'CHAIR-004', 규격: '대', 단위: '개', 창고코드: 'FIN-01', 수량: '50' }
];

const rowData = ref([]);

watch(
  tab,
  (newVal) => {
    if (newVal === 0) rowData.value = rawMaterialsData;
    else if (newVal === 1) rowData.value = subMaterialsData;
    else if (newVal === 2) rowData.value = consumablesData;
    else if (newVal === 3) rowData.value = finishedGoodsData;
  },
  { immediate: true }
);

const page = ref({ title: '재고 ' });
const breadcrumbs = shallowRef([
  {
    title: '자재',
    disabled: true,
    href: '#'
  },
  {
    title: '재고 조회',
    disabled: false,
    href: '#'
  }
]);

const materialName = ref('');
const materialCode = ref('');
const manager = ref('');
const storageCode = ref('');

function inputReset() {
  materialName.value = '';
  materialCode.value = '';
  manager.value = '';
  storageCode.value = '';
  alert('초기화 되었습니다.');
}

function fileSelect() {
  alert('검색하는 버튼');
}

// ----------------- 모달 선택 확인 -----------------
function onModalConfirm(selectedRows) {
  if (!Array.isArray(selectedRows)) selectedRows = [selectedRows];

  if (selectedRows.length > 0) {
    materialName.value = selectedRows[0].자재명 || '';
    materialCode.value = selectedRows[0].자재코드 || '';
  }
  // 창고코드 모달 선택 시 추가
}
</script>

<style scoped>
.icons {
  margin-left: 19rem;
  margin-bottom: 1rem;
}

.icons:hover {
  cursor: pointer;
}

.radioDiv {
  margin-left: 1rem;
}

.div {
  padding: 0.5rem;
}

.tab {
  background-color: #eeeeee;
}

.tab:focus {
  background-color: white;
}
</style>
