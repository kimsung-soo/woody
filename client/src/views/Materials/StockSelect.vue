<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <UiParentCard title="재고 검색조건">
    <v-row class="mb-4">
      <v-col cols="4">
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
      <v-col cols="4">
        <v-text-field label="자재코드" v-model="materialCode" placeholder="자재코드" dense outlined readonly></v-text-field>
      </v-col>
      <v-col cols="4">
        <v-text-field label="담당자" v-model="manager" placeholder="담당자" dense outlined />
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
    <v-tab class="tab">재공품</v-tab>
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
import axios from 'axios';
const quartz = themeQuartz;

// ----------------- 모달 (기본 정의) -----------------
const modalRef = ref(null);
const modalTitle = ref('');
const modalRowData = ref([]);
const modalColDefs = ref([]);

const materialColDefs = [
  { field: '자재코드', headerName: '자재코드', flex: 1 },
  { field: '자재명', headerName: '자재명', flex: 1 },
  { field: '자재유형', headerName: '자재유형', flex: 1 },
  { field: '규격', headerName: '규격', flex: 1 },
  { field: '단위', headerName: '단위', flex: 1 }
];
const materialRowData = ref([]);

const openModal = async (title) => {
  modalTitle.value = title;
  modalColDefs.value = materialColDefs;

  try {
    const res = await axios.get('http://localhost:3000/materials');
    modalRowData.value = res.data.map((mat) => ({
      자재코드: mat.MAT_CODE,
      자재명: mat.MAT_NAME,
      자재유형: mat.MAT_TYPE,
      규격: mat.MAT_SIZE,
      단위: mat.MAT_UNIT
    }));

    if (modalRef.value) {
      modalRef.value.open();
    }
  } catch (error) {
    console.error('자재 목록을 가져오는 중 오류가 발생했습니다:' + error);
    alert('자재 목록을 불러오는 데 실패했습니다.');
  }
};

function onModalConfirm(selectedRow) {
  if (selectedRow) {
    materialName.value = selectedRow.자재명;
    materialCode.value = selectedRow.자재코드;
  }
}

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
