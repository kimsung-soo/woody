<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="자재반품요청서 등록">
    <MoDal ref="modalRef" :title="modalTitle" :rowData="modalRowData" :colDefs="modalColDefs" @confirm="onModalConfirm" />
    <v-row class="mb-4">
      <v-btn
        color="warning"
        class="mr-2 button"
        @click="openModal('자재검수성적서 조회', materialRowData, materialColDefs)"
        style="margin-bottom: 2rem"
      >
        불량품 조회
      </v-btn>
    </v-row>
    <v-row class="mb-4">
      <v-col cols="6">
        <v-text-field label="작성일자" v-model="form.insertDate" type="date" dense outlined />
      </v-col>
      <v-col cols="6">
        <v-text-field label="회수요청일자" v-model="form.reDate" type="date" dense outlined />
      </v-col>
    </v-row>

    <ag-grid-vue
      :rowData="rowData"
      :columnDefs="colDefs"
      :theme="quartz"
      style="height: 200px; width: 100%"
      @cell-value-changed="onCellValueChanged"
    >
    </ag-grid-vue>

    <v-container>
      <v-textarea v-model="form.returnReason" label="사유 및 요청 사항을 입력하세요" outlined rows="4" auto-grow />
    </v-container>

    <v-row class="mb-4">
      <v-col cols="6">
        <v-text-field label="총금액" v-model="form.totalPrice" outlined readonly />
      </v-col>
      <v-col cols="6">
        <v-text-field label="담당자" v-model="form.manager" outlined />
      </v-col>
    </v-row>

    <!-- 버튼 -->
    <v-row justify="end">
      <v-btn color="error" class="mr-2" @click="resetForm">초기화</v-btn>
      <v-btn color="primary" @click="submitForm">등록</v-btn>
    </v-row>
  </UiParentCard>
</template>

<script setup>
import { ref, shallowRef, reactive } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { AgGridVue } from 'ag-grid-vue3';
import { themeQuartz } from 'ag-grid-community';
import MoDal from '../common/NewModal.vue';

const quartz = themeQuartz;

// ----------------- 그리드 데이터 -----------------
const rowData = ref([]);

const colDefs = ref([
  { field: '입고번호', flex: 1 },
  { field: '자재명', flex: 1 },
  { field: '자재코드', flex: 1 },
  { field: '규격', flex: 1 },
  { field: '단위', flex: 1 },
  { field: '단가', flex: 1 },
  { field: '금액', flex: 1, valueFormatter: (params) => formatNumber(params.value) },
  { field: '수량', flex: 1 },
  { field: '불량유형', flex: 1 }
]);

// ----------------- 폼 입력 필드 -----------------
const form = reactive({
  insertDate: '',
  reDate: '',
  manager: '',
  totalPrice: '', // 총금액
  returnReason: ''
});

// ----------------- 모달 -----------------
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
    발행번호: '20250808-002',
    업체: '합판월드',
    자재명: '합판',
    규격: 'mm',
    자재코드: 'ABC-123',
    발주일자: '2025-08-08',
    수량: 5,
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

// ----------------- 총금액 계산 -----------------
function calculateTotalPrice() {
  const total = rowData.value.reduce((sum, item) => {
    const price = Number(item.단가) || 0;
    const qty = Number(item.수량) || 0;
    return sum + price * qty;
  }, 0);
  form.totalPrice = total.toLocaleString();
}

const formatNumber = (num) => {
  if (num == null) return '';
  return new Intl.NumberFormat('ko-KR').format(Number(num));
};

// ----------------- 모달 선택 확인 -----------------
function onModalConfirm(selectedRows) {
  if (!Array.isArray(selectedRows)) selectedRows = [selectedRows];

  if (selectedRows.length > 0) {
    form.issueNumber = selectedRows[0].발행번호 || '';
    form.name = selectedRows[0].업체 || '';
    form.insertDate = new Date().toISOString().slice(0, 10); // 오늘 날짜
  }

  // 첫 번째 선택 항목으로 발행번호/업체/날짜 설정
  if (selectedRows.length > 0) {
    form.insertDate = selectedRows[0].작성일자 || '';
    form.name = selectedRows[0].업체 || '';
    form.insertDate = new Date().toISOString().slice(0, 10);
  }

  // 선택된 항목들 그리드에 추가
  selectedRows.forEach((row) => {
    rowData.value.push({
      입고번호: row.입고번호 || '',
      자재명: row.자재명 || '',
      자재코드: row.자재코드 || '',
      규격: row.규격 || '',
      단위: row.단위 || 'EA',
      단가: row.단가 || 0,
      금액: row.금액 || 0,
      수량: row.수량 || 0,
      불량유형: row.불량유형 || ''
    });
  });

  // 총금액 계산
  calculateTotalPrice();
}

// ----------------- 셀 값 변경 시 -----------------
function onCellValueChanged() {
  calculateTotalPrice();
}

// ----------------- 리셋 / 제출 -----------------
function resetForm() {
  form.issueNumber = '';
  form.insertDate = '';
  form.manager = '';
  form.totalPrice = '';
  rowData.value = [];
  alert('초기화 되었습니다.');
}

function submitForm() {
  console.log('제출된 폼:', { form: { ...form }, items: rowData.value });
  alert('폼 제출 성공');
}

// 페이지/브레드크럼
const page = ref({ title: '불량품' });
const breadcrumbs = shallowRef([
  { title: '자재', disabled: true, href: '#' },
  { title: '자재반품요청서 등록 ', disabled: false, href: '#' }
]);
</script>

<style scoped>
.button {
  margin-top: 1rem;
  margin-left: 1rem;
}
</style>
