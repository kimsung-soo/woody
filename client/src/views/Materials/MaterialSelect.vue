<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <UiParentCard title="입고 검색조건">
    <v-row class="mb-4">
      <v-col cols="4">
        <v-text-field label="자재명" v-model="materialName" dense outlined readonly>
          <template #append-inner>
            <i
              class="fa-solid fa-magnifying-glass"
              style="cursor: pointer; font-size: large; margin-right: 0.5rem"
              @click="openModal('자재 조회', materialRowData, materialColDefs)"
            ></i>
          </template>
        </v-text-field>
      </v-col>
      <v-col cols="4">
        <v-text-field label="자재코드" v-model="materialCode" dense outlined readonly />
      </v-col>
      <v-col cols="4">
        <div class="radioDiv">
          <span class="mr-2">자재유형:</span>
          <v-radio-group v-model="materialType" inline hide-details>
            <v-radio label="원자재" value="원자재" />
            <v-radio label="부자재" value="부자재" />
            <v-radio label="소모품" value="소모품" />
          </v-radio-group>
        </div>
      </v-col>
    </v-row>
    <v-row class="mb-4">
      <v-col cols="4">
        <v-text-field label="입고일자" v-model="insertDate" type="date" dense outlined />
      </v-col>
      <v-col cols="4"></v-col>
      <v-col cols="4">
        <div class="radioDiv">
          <span class="mr-2">상태:</span>
          <v-radio-group v-model="status" inline hide-details>
            <v-radio label="입고" value="입고" />
            <v-radio label="검수 대기" value="검수 대기" />
            <v-radio label="입고 완료" value="입고 완료" />
          </v-radio-group>
        </div>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-btn color="error" class="mr-2" @click="inputReset">초기화</v-btn>
      <v-btn color="darkText" @click="fileSelect">검색</v-btn>
    </v-row>
  </UiParentCard>
  <div class="div"></div>
  <UiParentCard title="입고 목록">
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
import { ref, shallowRef } from 'vue';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { AgGridVue } from 'ag-grid-vue3';
import { themeQuartz } from 'ag-grid-community';
import MoDal from '../common/NewModal.vue';
const quartz = themeQuartz;

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

// ag grid
const rowData = ref([
  {
    발행번호: 'ORD-20250808-001',
    공급업체: '합판세상',
    자재명: '합판',
    자재코드: 'MLT-00123',
    규격: 'SD400',
    단위: 'EA',
    발주일자: '2025-08-08',
    납기일자: '2025-08-20',
    담당자: '이동섭',
    수량: '10',
    상태: '입고'
  },
  {
    발행번호: 'ORD-20250808-002',
    공급업체: '원목세상',
    자재명: '원목',
    자재코드: 'MLT-00123',
    규격: 'SD400',
    단위: 'EA',
    발주일자: '2025-08-08',
    납기일자: '2025-08-20',
    담당자: '이동섭',
    수량: '10',
    상태: '검수 대기'
  },
  {
    발행번호: 'ORD-20250808-002',
    공급업체: '원목세상',
    자재명: '원목',
    자재코드: 'MLT-00123',
    규격: 'SD400',
    단위: 'EA',
    발주일자: '2025-08-08',
    납기일자: '2025-08-20',
    담당자: '이동섭',
    수량: '10',
    상태: '완료'
  }
]);

const colDefs = ref([
  { field: '발행번호', flex: 2 },
  { field: '공급업체', flex: 1 },
  { field: '자재명', flex: 1 },
  { field: '자재코드', flex: 1 },
  { field: '규격', flex: 1 },
  { field: '단위', flex: 1 },
  { field: '발주일자', flex: 1.5 },
  { field: '납기일자', flex: 1.5 },
  { field: '담당자', flex: 1 },
  { field: '수량', flex: 1 },
  {
    field: '상태',
    flex: 1,
    cellStyle: (params) => {
      if (params.value == '입고') {
        return { color: 'black', fontWeight: 'bold' };
      } else if (params.value == '검수 대기') {
        return { color: 'blue', fontWeight: 'bold' };
      } else if (params.value == '완료') {
        return { color: 'red', fontWeight: 'bold' };
      }
      return null;
    }
  }
]);

const page = ref({ title: '입고' });
const breadcrumbs = shallowRef([
  {
    title: '자재',
    disabled: true,
    href: '#'
  },
  {
    title: '입고 조회',
    disabled: false,
    href: '#'
  }
]);

const materialName = ref('');
const materialCode = ref('');
const insertDate = ref('');
const materialType = ref('');
const status = ref('');

function inputReset() {
  materialName.value = '';
  materialCode.value = '';
  insertDate.value = '';
  materialType.value = '';
  status.value = '';
  alert('초기화 되었습니다.');
}

function fileSelect() {
  alert('검색하는 버튼');
}

function onModalConfirm(selectedRow) {
  if (!selectedRow) return;

  materialName.value = selectedRow['자재명'] || '';
  materialCode.value = selectedRow['자재코드'] || '';
}
</script>

<style scoped>
.radioDiv {
  margin-left: 1rem;
}

.div {
  padding: 0.5rem;
}
</style>
