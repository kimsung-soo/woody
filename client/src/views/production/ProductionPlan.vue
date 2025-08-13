<!-- 생산계획 등록 -->
<!-- src/views/production/ProductionPlan.vue -->
<template>
  <BaseBreadcrumb :title="pageMeta.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard>
    <!-- 상단: 좌 제목 / 우측 '생산의뢰 조회' -->
    <div class="card-headline only-right">
      <h5 class="title">생산계획 등록</h5>
      <div class="right-actions">
        <v-btn color="warning" @click="openPlanDialog">생산의뢰 조회</v-btn>
      </div>
    </div>

    <!-- 기본 정보 -->
    <v-row class="mb-2">
      <v-col cols="4">
        <v-text-field label="계획번호" v-model="form.issueNumber" readonly dense outlined />
      </v-col>
      <v-col cols="4">
        <v-text-field label="계획명" v-model="form.orderDate" dense outlined />
      </v-col>
      <v-col cols="4">
        <v-text-field label="작성자" v-model="form.contact" dense outlined />
      </v-col>

      <v-col cols="4">
        <v-text-field label="주문번호" v-model="form.productCode" readonly dense outlined />
      </v-col>
      <v-col cols="4">
        <v-text-field label="작성일자" v-model="form.dueDate" type="date" dense outlined />
      </v-col>
      <v-col cols="4">
        <v-text-field label="납기일자" v-model="form.dueDate2" type="date" dense outlined />
      </v-col>

      <v-col cols="4">
        <v-text-field label="총 수량" v-model.number="form.targetQty" type="number" dense outlined />
      </v-col>
      <v-col cols="4">
        <v-text-field label="제품코드" v-model="form.productCode" readonly dense outlined />
      </v-col>
      <v-col cols="4">
        <v-text-field label="제품명칭" v-model="form.productName" readonly dense outlined />
      </v-col>

      <v-col cols="12">
        <v-textarea label="비고" v-model.trim="form.memo" rows="2" auto-grow dense variant="outlined" class="text-right" />
      </v-col>
    </v-row>

    <!-- 비고란 아래 가운데: 초기화/등록 버튼 -->
    <div class="center-actions-under-note">
      <v-btn variant="flat" color="error" @click="resetPlan">초기화</v-btn>
      <v-btn color="primary" @click="savePlan">생산계획 등록</v-btn>
    </div>

    <!-- 제품목록 -->
    <section class="pane mt-4">
      <div class="pane-head">
        <h5 class="pane-title">제품목록</h5>
        <!-- 우측: 검색 입력 + 제품등록 버튼 -->
        <div class="pane-action">
          <v-text-field
            v-model.trim="productKeyword"
            placeholder="제품코드/명 검색"
            hide-details
            density="compact"
            variant="outlined"
            class="search-input-right"
            @keyup.enter="doProductSearch"
          />
          <v-btn color="primary" class="ml-2" @click="applySelectedProduct">제품 등록</v-btn>
        </div>
      </div>

      <ag-grid-vue
        class="ag-theme-quartz ag-no-wrap"
        :rowData="pagedProducts"
        :columnDefs="productColDefs"
        :pagination="true"
        :paginationPageSize="PROD_PAGE_SIZE"
        :suppressPaginationPanel="false"
        :domLayout="'autoHeight'"
        :rowSelection="'single'"
        :rowMultiSelectWithClick="false"
        @grid-ready="onProductGridReady"
        @first-data-rendered="sizeFitProduct"
        @grid-size-changed="sizeFitProduct"
      />

      <!-- 선택 고정 유형 배지(선택적 표시) -->
      <div class="table-footline">
        <v-chip v-if="lockedType" size="small" color="primary" variant="tonal"> 선택 고정 유형: {{ lockedType }} </v-chip>
      </div>
    </section>

    <!-- 생산의뢰 모달 (ag-Grid) -->
    <v-dialog v-model="planDialog" width="90vw">
      <v-card class="plan-card">
        <v-card-title class="d-flex align-center justify-space-between">
          <span>생산의뢰 목록</span>
          <v-text-field
            v-model.trim="planKeyword"
            placeholder="의뢰번호/주문번호/제품명 검색"
            hide-details
            density="compact"
            variant="outlined"
            style="width: 320px"
            @keyup.enter="doPlanSearch"
          />
        </v-card-title>
        <v-card-text class="dialog-body">
          <ag-grid-vue
            class="ag-theme-quartz ag-no-wrap"
            :rowData="pagedPlans"
            :columnDefs="planColDefs"
            :pagination="true"
            :paginationPageSize="PLAN_PAGE_SIZE"
            :rowSelection="'multiple'"
            :rowMultiSelectWithClick="true"
            :suppressRowClickSelection="true"
            :domLayout="'autoHeight'"
            @grid-ready="onPlanGridReady"
            @first-data-rendered="sizeFitPlan"
            @grid-size-changed="sizeFitPlan"
            @selection-changed="onPlanSelectionChanged"
          />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="flat" color="darkText" @click="planDialog = false">닫기</v-btn>
          <v-btn variant="flat" color="success" @click="applyPlans">적용</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.open" :color="snack.color" :timeout="2000">
      {{ snack.msg }}
    </v-snackbar>
  </UiParentCard>
</template>

<script setup>
import { ref, computed, shallowRef, onMounted } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { AgGridVue } from 'ag-grid-vue3';

/* 헤더 */
const pageMeta = ref({ title: '생산계획 관리' });
const breadcrumbs = shallowRef([
  { title: '생산', disabled: true, href: '#' },
  { title: '생산계획 관리', disabled: false, href: '#' }
]);

/* 폼 */
const form = ref({
  issueNumber: '',
  orderDate: '',
  contact: '',
  productCode: '',
  dueDate: '',
  dueDate2: '',
  targetQty: 0,
  productName: '',
  memo: '',
  productType: '' // 유형 잠금
});
function genPlanNo() {
  const d = new Date();
  return `PL-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 9000) + 1000}`;
}
onMounted(() => {
  form.value.issueNumber = genPlanNo();
});

/* ===== 제품 데이터/검색 ===== */
const products = ref([
  { code: 'ABC-1234', name: '블랙 데스크', uom: 'EA', spec: '1200x600', type: '완제품', stock: 12 },
  { code: 'B-2201', name: '화이트 데스크', uom: 'EA', spec: '1200x600', type: '완제품', stock: 4 },
  { code: 'C-0003', name: '협탁', uom: 'EA', spec: '500x500', type: '반제품', stock: 11 },
  { code: 'C-0004', name: '상판', uom: 'EA', spec: '1200x600', type: '반제품', stock: 50 },
  { code: 'P-9001', name: '라운드 테이블', uom: 'EA', spec: 'Ø900', type: '완제품', stock: 7 }
]);
const productKeyword = ref('');
const PROD_PAGE_SIZE = 5;

const lockedType = computed(() => form.value.productType || null);
const filteredProducts = computed(() => {
  const kw = productKeyword.value.trim().toLowerCase();
  return products.value
    .filter((p) => !lockedType.value || p.type === lockedType.value)
    .filter((p) => !kw || p.code.toLowerCase().includes(kw) || p.name.toLowerCase().includes(kw));
});
const pagedProducts = computed(() => filteredProducts.value);
function doProductSearch() {
  if (!filteredProducts.value.length) toast('검색결과가 없습니다.', 'error');
}

/* ag-Grid 공통 셀 옵션 */
const textCell = {
  cellStyle: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  tooltipValueGetter: (p) => p.value
};
const numRight = {
  ...textCell,
  cellClass: 'ag-right-aligned-cell',
  valueFormatter: (p) => (p.value == null ? '' : String(p.value))
};

/* 제품 컬럼 */
const productColDefs = [
  { headerName: '제품코드', field: 'code', flex: 1.1, minWidth: 120, ...textCell },
  { headerName: '제품명칭', field: 'name', flex: 1.6, minWidth: 140, ...textCell },
  { headerName: '유형', field: 'type', flex: 0.8, minWidth: 90, ...textCell },
  { headerName: '단위', field: 'uom', flex: 0.6, minWidth: 70, ...textCell },
  { headerName: '규격', field: 'spec', flex: 1.2, minWidth: 120, ...textCell },
  { headerName: '현재고', field: 'stock', flex: 0.7, minWidth: 80, ...numRight }
];

/* 제품 그리드 API */
let productApi;
function onProductGridReady(e) {
  productApi = e.api;
  sizeFitProduct();
}
function sizeFit(api) {
  if (api) api.sizeColumnsToFit();
}
function sizeFitProduct() {
  sizeFit(productApi);
}

/* 제품 등록 버튼: 현재 선택 행 사용 */
function applySelectedProduct() {
  if (!productApi) return toast('그리드 준비중입니다.', 'error');
  const rows = productApi.getSelectedRows?.() ?? [];
  if (!rows.length) return toast('등록할 제품을 선택하세요.', 'error');

  const p = rows[0];
  if (!form.value.productType) form.value.productType = p.type;
  if (form.value.productType !== p.type) {
    return toast(`선택 가능한 유형은 '${form.value.productType}' 입니다.`, 'error');
  }
  form.value.productCode = p.code;
  form.value.productName = p.name;
  toast('제품이 계획서에 등록되었습니다.');
}

/* ===== 생산의뢰 모달 ===== */
const planDialog = ref(false);
const planKeyword = ref('');
const PLAN_PAGE_SIZE = 10;

const plans = ref([
  {
    id: '1',
    seq: 1,
    reqNo: 'REQ-20250811-2856',
    orderNo: 'ORD-001',
    createdAt: '2025-08-11 09:10',
    writer: '이동현',
    totalQty: 100,
    dueDate: '2025-08-30',
    productCode: 'ABC-1234',
    productName: '블랙 데스크',
    productType: '완제품'
  },
  {
    id: '2',
    seq: 2,
    reqNo: 'REQ-20250705-4112',
    orderNo: 'ORD-002',
    createdAt: '2025-07-05 10:10',
    writer: '김태완',
    totalQty: 120,
    dueDate: '2025-09-05',
    productCode: 'C-0003',
    productName: '협탁',
    productType: '반제품'
  }
]);
const filteredPlans = computed(() => {
  const kw = planKeyword.value.trim().toLowerCase();
  if (!kw) return plans.value;
  return plans.value.filter(
    (r) => r.reqNo.toLowerCase().includes(kw) || r.orderNo.toLowerCase().includes(kw) || r.productName.toLowerCase().includes(kw)
  );
});
const pagedPlans = computed(() => filteredPlans.value);

const planColDefs = [
  { headerName: '', checkboxSelection: true, headerCheckboxSelection: true, width: 70 },
  { headerName: '순번', field: 'seq', width: 80, ...numRight },
  { headerName: '의뢰번호', field: 'reqNo', minWidth: 150, flex: 1, ...textCell },
  { headerName: '주문번호', field: 'orderNo', minWidth: 120, ...textCell },
  { headerName: '제품코드', field: 'productCode', minWidth: 120, ...textCell },
  { headerName: '제품명', field: 'productName', minWidth: 140, flex: 1, ...textCell },
  { headerName: '유형', field: 'productType', width: 100, ...textCell },
  { headerName: '작성일시', field: 'createdAt', minWidth: 140, ...textCell },
  { headerName: '작성자', field: 'writer', width: 100, ...textCell },
  { headerName: '총수량', field: 'totalQty', width: 110, ...numRight },
  { headerName: '납기일자', field: 'dueDate', minWidth: 120, ...textCell }
];

/* 모달 그리드 */
let planApi;
function onPlanGridReady(e) {
  planApi = e.api;
  sizeFitPlan();
}
function sizeFitPlan() {
  sizeFit(planApi);
}
function doPlanSearch() {
  if (!filteredPlans.value.length) toast('검색결과가 없습니다.', 'error');
}

/* 선택 제약: 같은 제품/유형만 복수 선택 허용 */
function onPlanSelectionChanged(e) {
  const selected = e.api.getSelectedRows();
  if (selected.length <= 1) return;
  const first = selected[0];
  for (const row of selected.slice(1)) {
    if (row.productCode !== first.productCode || row.productType !== first.productType) {
      e.api.forEachNode((node) => {
        if (node.isSelected() && (node.data.productCode !== first.productCode || node.data.productType !== first.productType)) {
          node.setSelected(false);
        }
      });
      toast('같은 제품/유형만 복수 선택 가능합니다.', 'error');
      break;
    }
  }
}

function openPlanDialog() {
  planKeyword.value = '';
  planDialog.value = true;
  setTimeout(() => {
    planApi?.deselectAll?.();
  }, 0);
}
function applyPlans() {
  if (!planApi) return toast('그리드 준비중입니다.', 'error');
  const selected = planApi.getSelectedRows?.() ?? [];
  if (!selected.length) return toast('선택된 의뢰가 없습니다.', 'error');

  const first = selected[0];
  form.value.productCode = first.productCode;
  form.value.productName = first.productName;
  form.value.productType = first.productType;
  form.value.contact = first.writer;
  form.value.targetQty = selected.reduce((s, r) => s + Number(r.totalQty || 0), 0);
  form.value.dueDate2 = selected.map((r) => r.dueDate).sort()[0];

  planDialog.value = false;
  toast('생산의뢰가 적용되었습니다.');
}

/* 저장/초기화/토스트 (✅ 콘솔 목업 출력 추가) */
function savePlan() {
  if (!form.value.issueNumber || !form.value.orderDate) return toast('계획번호/계획명을 입력하세요.', 'error');
  if (!form.value.productCode) return toast('제품을 등록하세요.', 'error');

  const selectedPlans = planApi?.getSelectedRows?.() ?? [];
  console.log('저장(생산계획 목업)', {
    form: { ...form.value },
    selectedPlans
  });

  alert('저장(목업). 콘솔 확인');
}
function resetPlan() {
  const keepNo = genPlanNo();
  form.value = {
    issueNumber: keepNo,
    orderDate: '',
    contact: '',
    productCode: '',
    dueDate: '',
    dueDate2: '',
    targetQty: 0,
    productName: '',
    memo: '',
    productType: ''
  };
  productApi?.deselectAll?.();
  planApi?.deselectAll?.();
  toast('초기화되었습니다.');
}
const snack = ref({ open: false, msg: '', color: 'primary' });
const toast = (msg, color = 'primary') => (snack.value = { open: true, msg, color });
</script>

<style scoped>
/* 상단 헤더: 좌 제목 / 우 버튼 */
.card-headline.only-right {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  margin-bottom: 8px;
}
.title {
  margin: 0;
  font-weight: 700;
}
.right-actions {
  justify-self: end;
}

/* 비고 하단 중앙 버튼 */
.center-actions-under-note {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 6px 0 10px;
}

/* 제품목록 헤더: 검색을 우측으로 밀고 버튼을 옆에 */
.pane-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  margin-bottom: 0.5rem;
}
.pane-title {
  margin: 0;
}
.pane-action {
  display: flex;
  align-items: center;
  margin-left: auto;
}
.search-input-right {
  width: 420px;
  max-width: 420px;
  min-width: 300px;
}

/* 표 하단 라인 */
.table-footline {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

/* ag-Grid 공통 */
.ag-no-wrap .ag-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ag-theme-quartz {
  --ag-font-size: 12px;
  --ag-grid-size: 4px;
}

/* 유틸 */
.text-right {
  text-align: right;
}
.ml-2 {
  margin-left: 8px;
}
.mt-4 {
  margin-top: 1rem;
}
</style>
