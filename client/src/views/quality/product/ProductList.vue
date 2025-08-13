<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>

  <UiParentCard>
    <v-row class="mb-4">
      <v-col cols="3">
        <v-text-field label="제품유형" v-model="form.prdType" dense outlined />
      </v-col>
      <v-btn
        color="warning"
        class="mr-2 button"
        @click="openModal('자재발주서 조회', materialRowData, materialColDefs)"
        style="margin-bottom: 2rem"
        >제품조회
      </v-btn>
      <MoDal ref="modalRef" :title="modalTitle" :rowData="modalRowData" :colDefs="modalColDefs" @confirm="onModalConfirm" />
    </v-row>
    <v-row class="mb-4">
      <v-col cols="3">
        <v-text-field label="검사완료일자" v-model="form.chkedDate" type="date" dense outlined />
      </v-col>
      <v-col cols="3">
        <v-text-field label="검사번호" v-model="form.certId" dense outlined />
      </v-col>
      <v-col cols="3">
        <v-text-field label="제품명" v-model="form.prdName" dense outlined />
      </v-col>
    </v-row>
    <br />
    <ag-grid-vue
      :rowData="gridData"
      :columnDefs="colDefs"
      :theme="quartz"
      :gridOptions="myGridOptions"
      @row-clicked="onRowClicked"
      style="height: 400px"
    />
  </UiParentCard>
</template>

<script setup>
import axios from 'axios';
import { useRouter } from 'vue-router';
import { ref, shallowRef, computed, onBeforeMount } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3'; // Vue Data Grid Component
import UiParentCard from '@/components/shared/UiParentCard.vue';
import MoDal from '@/views/common/NewModal.vue';

// ----------------- 모달 (기본 정의) -----------------
const modalRef = ref(null);
const modalTitle = ref('');
const modalRowData = ref([]);
const modalColDefs = ref([]);

const materialColDefs = [
  { field: '발행번호', headerName: '발행번호', flex: 1.2 },
  { field: '업체', headerName: '공급업체', flex: 1 },
  { field: '자재명', headerName: '자재명', flex: 0.8 },
  { field: '자재코드', headerName: '자재코드', flex: 0.8 },
  { field: '규격', headerName: '규격', flex: 0.6 },
  { field: '발주일자', headerName: '발주일자', flex: 1 },
  { field: '수량', headerName: '수량', flex: 0.6 },
  { field: '상태', headerName: '상태', flex: 0.6 }
];
const materialRowData = ref([
  {
    발행번호: '20250808-001',
    업체: '원목세상',
    자재명: '원목',
    규격: 'mm',
    자재코드: 'ZCB-558',
    발주일자: '2025-08-08',
    수량: 10,
    상태: '완료'
  },
  {
    발행번호: '20250808-001',
    업체: '원목세상',
    자재명: '원목',
    규격: 'mm',
    자재코드: 'ZCB-558',
    발주일자: '2025-08-08',
    수량: 10,
    상태: '완료'
  }
]);

const openModal = (title, rowData, colDefs) => {
  modalTitle.value = title;
  modalRowData.value = rowData;
  modalColDefs.value = colDefs;
  if (modalRef.value) {
    modalRef.value.open();
  }
};

function onModalConfirm(selectedRow) {
  // 폼에 발행번호 / 업체명 반영
  form.issueNumber = selectedRow.발행번호 || '';
  form.name = selectedRow.업체 || '';

  const today = new Date();
  form.insertDate = today.toISOString().slice(0, 10);

  // 그리드 데이터에 추가
  rowData.value.push({
    자재명: selectedRow.자재명 || '',
    자재코드: selectedRow.자재코드 || '',
    규격: selectedRow.규격 || '',
    단위: selectedRow.단위 || 'EA',
    자재유형: selectedRow.자재유형 || '',
    발주수량: selectedRow.수량 || 0
  });
}

ModuleRegistry.registerModules([AllCommunityModule]);

const quartz = themeQuartz;
const router = useRouter();

const page = ref({ title: '제품검사성적서 조회' });
const breadcrumbs = shallowRef([
  {
    title: '품질',
    disabled: true,
    href: '#'
  },
  {
    title: '성적서조회',
    disabled: false,
    href: '#'
  }
]);

const form = ref({
  chkedDate: '',
  certId: '',
  prdName: '',
  prdType: ''
});

// db연결
const getPrdList = async () => {
  let result = await axios.get('/prdcertlist').catch((err) => console.log(err));
  rowData.value.certId = result.data.CERT_ID;
  console.log(rowData.value);
};

onBeforeMount(() => {
  getPrdList();
});

// 한글 헤더는 headerName으로
const colDefs = ref([
  { headerName: '검사번호', field: 'certId' },
  { headerName: '제품코드', field: 'prdCode' },
  { headerName: '제품명', field: 'prdName' },
  { headerName: '검사완료일자', field: 'chkedDate' },
  { headerName: '제품유형', field: 'prdType' }
]);

const rowData = ref([
  { certId: 'QC100', prdCode: 'DSK100', prdName: '흰색학생책상', chkedDate: '2025-08-12', prdType: '완제품' },
  { certId: 'QC101', prdCode: 'DSK101', prdName: '검은색학생책상', chkedDate: '2025-08-12', prdType: '완제품' },
  { certId: 'QC102', prdCode: 'DSK102', prdName: '파란색학생책상', chkedDate: '2025-08-12', prdType: '반제품' },
  { certId: 'QC103', prdCode: 'DSK103', prdName: '노란색학생책상', chkedDate: '2025-08-12', prdType: '반제품' },
  { certId: 'QC104', prdCode: 'DSK104', prdName: '분홍색학생책상', chkedDate: '2025-08-12', prdType: '완제품' }
]);

// 검색활성화
const gridData = computed(() => {
  const date = (form.value.chkedDate || '').trim(); // 날짜는 소문자 불필요
  const cid = (form.value.certId || '').trim().toLowerCase();
  const prdn = (form.value.prdName || '').trim().toLowerCase();
  const prdt = (form.value.prdType || '').trim().toLowerCase();

  const toL = (v) => (v ?? '').toString().toLowerCase().trim();

  return rowData.value.filter((r) => {
    const byChkDate = !date || (r.chkedDate ?? '').includes(date);
    const byCid = !cid || toL(r.certId).includes(cid); // 부분일치
    const byPrdn = !prdn || toL(r.prdName).includes(prdn); //  제품명 포함 검색
    const byPrdt = !prdt || toL(r.prdType).includes(prdt); //  유형 포함(또는 ===)
    return byChkDate && byCid && byPrdn && byPrdt;
  });
});

const myGridOptions = ref({
  defaultColDef: { flex: 1, minWidth: 100, resizable: true },
  columnDefs: colDefs,
  pagination: true,
  paginationAutoPageSize: true
});

// 행 클릭 이벤트 핸들러
const onRowClicked = (event) => {
  const rowData = event.data;
  console.log('클릭된 행:', rowData);

  // /qm/qrdpass 경로로 이동하면서 데이터 전달
  router.push({
    path: '/qm/prdlstdtl',
    query: {
      prdCode: rowData.certId
    }
  });

  // 또는 단순히 경로만 이동하고 싶다면:
  // router.push('/qm/qrdpass');
};
</script>
