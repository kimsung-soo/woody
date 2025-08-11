<!-- 작업지시 관리 페이지 -->
<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <!-- 제목줄 + 우측 버튼(커스텀 헤더) -->
  <UiParentCard>
    <div class="card-headline">
      <h5 class="title">작업지시 등록</h5>
      <v-btn color="warning" @click="openPlanDialog">계획서 조회</v-btn>
    </div>

    <!-- 상단 기본정보 -->
    <v-row class="mb-4">
      <v-col cols="4">
        <v-text-field label="지시번호" v-model="form.issueNumber" readonly dense outlined />
      </v-col>

      <v-col cols="4">
        <v-text-field label="지시일자" v-model="form.orderDate" type="date" dense outlined />
      </v-col>

      <v-col cols="4">
        <v-text-field label="작성자" v-model="form.contact" dense outlined />
      </v-col>

      <!-- 다음 줄 -->
      <v-col cols="4">
        <v-text-field label="제품코드" v-model="form.productCode" readonly dense outlined />
      </v-col>
      <v-col cols="4">
        <v-text-field label="납기일자" v-model="form.dueDate" type="date" dense outlined />
      </v-col>
      <v-col cols="4">
        <v-text-field label="목표수량" v-model.number="form.targetQty" type="number" min="0" step="1" dense outlined @input="recalcNeed" />
      </v-col>

      <v-col cols="4">
        <v-text-field label="제품명칭" v-model="form.productName" readonly dense outlined />
      </v-col>
    </v-row>

    <!-- 본문 2열: 좌(제품목록) / 우(재공품현황 -> BOM목록) -->
    <div class="main-2col">
      <!-- 좌: 제품목록 -->
      <section class="pane">
        <div class="pane-head">
          <h5 class="pane-title">제품목록</h5>
          <div class="pane-action">
            <v-text-field
              v-model.trim="productKeyword"
              placeholder="제품코드/명 검색"
              hide-details
              density="compact"
              variant="outlined"
              style="max-width: 420px; min-width: 360px; width: 100%"
              @keyup.enter="doProductSearch"
            />
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
          @grid-ready="onProductGridReady"
          @first-data-rendered="sizeFitProduct"
          @grid-size-changed="sizeFitProduct"
          @row-selected="onProductSelected"
        />
      </section>

      <!-- 우: 재공품현황 -> BOM목록 -->
      <section class="pane right-pane">
        <div class="pane-head">
          <h5 class="pane-title">재공품현황</h5>
        </div>
        <ag-grid-vue
          class="ag-theme-quartz ag-no-wrap"
          :rowData="pagedWip"
          :columnDefs="wipColDefs"
          :pagination="true"
          :paginationPageSize="SUB_PAGE_SIZE"
          :suppressPaginationPanel="false"
          :domLayout="'autoHeight'"
          @grid-ready="onWipGridReady"
          @first-data-rendered="sizeFitWip"
          @grid-size-changed="sizeFitWip"
        />

        <!-- BOM 목록 -->
        <div class="pane-head mt-6">
          <h5 class="pane-title">BOM목록</h5>
        </div>
        <ag-grid-vue
          class="ag-theme-quartz ag-no-wrap bom-grid"
          :rowData="pagedBom"
          :columnDefs="bomColDefs"
          :pagination="true"
          :paginationPageSize="SUB_PAGE_SIZE"
          :suppressPaginationPanel="false"
          :domLayout="'autoHeight'"
          @grid-ready="onBomGridReady"
          @first-data-rendered="sizeFitBom"
          @grid-size-changed="sizeFitBom"
        />
      </section>
    </div>

    <!-- 하단 버튼 -->
    <v-row justify="end" class="mt-6">
      <v-btn color="error" class="mr-2" @click="resetForm">초기화</v-btn>
      <v-btn color="success" @click="submitForm">저장</v-btn>
    </v-row>
  </UiParentCard>

  <!-- 계획서 모달 -->
  <v-dialog v-model="planDialog" width="90vw">
    <v-card class="plan-card">
      <v-card-title class="d-flex align-center justify-space-between">
        <span>계획서 목록</span>
        <v-text-field
          v-model.trim="planKeyword"
          placeholder="계획번호/제품코드/제품명 검색"
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
        <v-btn variant="flat" color="success" @click="applyPlans">등록</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, shallowRef, reactive, computed, onMounted } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { AgGridVue } from 'ag-grid-vue3';

/* ===== 페이지 타이틀 ===== */
const page = ref({ title: '작업지시 관리' });
const breadcrumbs = shallowRef([
  { title: '생산', disabled: true, href: '#' },
  { title: '작업지시 관리', disabled: false, href: '#' }
]);

/* ===== 폼 ===== */
const form = reactive({
  issueNumber: '',
  orderDate: '',
  contact: '',
  productCode: '',
  productName: '',
  dueDate: '',
  targetQty: 10
});
function genIssueNo() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rnd = Math.floor(Math.random() * 9000 + 1000);
  return `WO-${y}${m}${day}-${rnd}`;
}
onMounted(() => {
  if (!form.issueNumber) form.issueNumber = genIssueNo();
  if (!form.orderDate) form.orderDate = new Date().toISOString().slice(0, 10);
});

/* ===== 더미 데이터 ===== */
const products = ref([
  { code: 'P001', name: '블랙 데스크', uom: 'EA', spec: '1200x600', type: '완제품' },
  { code: 'P002', name: '화이트 데스크', uom: 'EA', spec: '1200x600', type: '완제품' },
  { code: 'P003', name: '블랙 데스크(소형)', uom: 'EA', spec: '1000x600', type: '완제품' },
  { code: 'P004', name: '라운드 테이블', uom: 'EA', spec: 'Ø900', type: '완제품' },
  { code: 'P005', name: '워런트 책상', uom: 'EA', spec: '1400x700', type: '완제품' },
  { code: 'P006', name: '메이플 책상', uom: 'EA', spec: '1200x600', type: '완제품' },
  { code: 'P007', name: '오크 책상', uom: 'EA', spec: '1000x500', type: '완제품' },
  { code: 'P008', name: '화이트 보드', uom: 'EA', spec: '1200x900', type: '완제품' },
  { code: 'P009', name: '블랙 보드', uom: 'EA', spec: '1200x900', type: '완제품' },
  { code: 'P010', name: '철제 선반(소)', uom: 'EA', spec: '900x400', type: '완제품' },
  { code: 'P011', name: '철제 선반(대)', uom: 'EA', spec: '1200x400', type: '완제품' },
  { code: 'P012', name: '원목 선반', uom: 'EA', spec: '1000x350', type: '완제품' },
  { code: 'P013', name: '협탁', uom: 'EA', spec: '500x500', type: '완제품' },
  { code: 'P014', name: '수납장(소)', uom: 'EA', spec: '800x400', type: '완제품' },
  { code: 'P015', name: '수납장(대)', uom: 'EA', spec: '1200x400', type: '완제품' },
  { code: 'P016', name: '원형 테이블(소)', uom: 'EA', spec: 'Ø700', type: '완제품' },
  { code: 'P017', name: '원형 테이블(대)', uom: 'EA', spec: 'Ø1200', type: '완제품' },
  { code: 'P018', name: '유리 테이블', uom: 'EA', spec: '1000x600', type: '완제품' }
]);

const bomMap = {
  P001: [
    { seq: 1, matCode: 'PP12', matName: '상판', matType: '원자재', perUnit: 1, spec: '1200x600', wipQty: 3, needQty: 0 },
    { seq: 2, matCode: 'PP48', matName: '다리', matType: '부자재', perUnit: 4, spec: '-', wipQty: 8, needQty: 0 },
    { seq: 3, matCode: 'SC01', matName: '나사세트', matType: '부자재', perUnit: 12, spec: 'M6', wipQty: 30, needQty: 0 }
  ]
};
const wipMap = {
  P001: [
    { type: '원목', qty: 10, spec: '800x400' },
    { type: '합판', qty: 12, spec: '1000x600' }
  ]
};
const makeDefaultBom = (p) => [
  { seq: 1, matCode: `${p.code}-TOP`, matName: '상판', matType: '원자재', perUnit: 1, spec: p.spec, wipQty: 0, needQty: 0 },
  { seq: 2, matCode: `${p.code}-LEG`, matName: '다리', matType: '부자재', perUnit: 4, spec: '-', wipQty: 0, needQty: 0 }
];
const makeDefaultWip = (p) => [{ type: '원목', qty: 0, spec: p.spec }];

/* ===== 검색/페이징 ===== */
const productKeyword = ref('');
const PROD_PAGE_SIZE = 10;
const SUB_PAGE_SIZE = 3;
const PLAN_PAGE_SIZE = 10;

const filteredProducts = computed(() => {
  const kw = productKeyword.value.trim().toLowerCase();
  if (!kw) return products.value;
  return products.value.filter((p) => p.code.toLowerCase().includes(kw) || p.name.toLowerCase().includes(kw));
});
const pagedProducts = computed(() => filteredProducts.value);
function doProductSearch() {}

/* 목록 상태 */
const wipRows = ref([]);
const bomRows = ref([]);
const pagedWip = computed(() => wipRows.value);
const pagedBom = computed(() => bomRows.value);

/* ===== 계산 ===== */
function recalcNeed() {
  const target = Number(form.targetQty || 0);
  bomRows.value = bomRows.value.map((b) => ({ ...b, needQty: Math.max(0, target * b.perUnit - (b.wipQty || 0)) }));
}
function loadByProductCode(code) {
  const p = products.value.find((x) => x.code === code);
  if (!p) return;
  form.productCode = p.code;
  form.productName = p.name;
  wipRows.value = (wipMap[p.code] ?? makeDefaultWip(p)).map((w) => ({ ...w }));
  bomRows.value = (bomMap[p.code] ?? makeDefaultBom(p)).map((b) => ({ ...b }));
  recalcNeed();
}

/* ===== AG Grid 컬럼 ===== */
const textCell = {
  cellStyle: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  tooltipValueGetter: (p) => p.value
};
const numRight = {
  ...textCell,
  cellClass: 'ag-right-aligned-cell',
  valueFormatter: (p) => (p.value == null ? '' : String(p.value))
};

const productColDefs = [
  { headerName: '제품코드', field: 'code', flex: 1.2, minWidth: 120, ...textCell },
  { headerName: '제품명', field: 'name', flex: 1.8, minWidth: 160, ...textCell },
  { headerName: '유형', field: 'type', flex: 0.8, minWidth: 90, ...textCell },
  { headerName: '단위', field: 'uom', flex: 0.6, minWidth: 70, ...textCell },
  { headerName: '규격', field: 'spec', flex: 1.2, minWidth: 120, ...textCell }
];

const wipColDefs = [
  { headerName: '원자재유형', field: 'type', flex: 1.2, minWidth: 120, ...textCell },
  { headerName: '수량', field: 'qty', flex: 0.6, minWidth: 80, ...numRight },
  { headerName: '규격', field: 'spec', flex: 1.2, minWidth: 120, ...textCell }
];

const bomColDefs = [
  { headerName: '순번', field: 'seq', flex: 0.5, minWidth: 60, ...numRight },
  { headerName: '자재코드', field: 'matCode', flex: 1.1, minWidth: 110, ...textCell },
  { headerName: '자재명', field: 'matName', flex: 1.2, minWidth: 110, ...textCell },
  { headerName: '자재유형', field: 'matType', flex: 0.9, minWidth: 90, ...textCell },
  { headerName: '단위별수량', field: 'perUnit', flex: 0.8, minWidth: 90, ...numRight },
  { headerName: '규격', field: 'spec', flex: 1.0, minWidth: 110, ...textCell },
  { headerName: '재공수량', field: 'wipQty', flex: 0.8, minWidth: 90, ...numRight },
  { headerName: '필요수량', field: 'needQty', flex: 0.8, minWidth: 90, ...numRight }
];

const planColDefs = [
  { headerName: '', checkboxSelection: true, headerCheckboxSelection: true, width: 70 },
  { headerName: '순번', field: 'seq', width: 80, ...numRight },
  { headerName: '계획번호', field: 'planNo', minWidth: 140, flex: 1, ...textCell },
  { headerName: '계획명', field: 'planName', minWidth: 140, flex: 1, ...textCell },
  { headerName: '주문코드', field: 'orderNo', minWidth: 120, ...textCell },
  { headerName: '제품코드', field: 'productCode', minWidth: 120, ...textCell },
  { headerName: '제품명', field: 'productName', minWidth: 140, flex: 1, ...textCell },
  { headerName: '유형', field: 'productType', width: 100, ...textCell },
  { headerName: '작성일시', field: 'createdAt', minWidth: 120, ...textCell },
  { headerName: '작성자', field: 'writer', width: 100, ...textCell },
  { headerName: '총수량', field: 'totalQty', width: 110, ...numRight },
  { headerName: '납기일자', field: 'dueDate', minWidth: 120, ...textCell }
];

/* ===== sizeToFit ===== */
let productApi, wipApi, bomApi, planApi;
function sizeFit(api) {
  if (api) api.sizeColumnsToFit();
}
function onProductGridReady(e) {
  productApi = e.api;
  sizeFitProduct();
}
function onWipGridReady(e) {
  wipApi = e.api;
  sizeFitWip();
}
function onBomGridReady(e) {
  bomApi = e.api;
  sizeFitBom();
}
function onPlanGridReady(e) {
  planApi = e.api;
  sizeFitPlan();
}
function sizeFitProduct() {
  sizeFit(productApi);
}
function sizeFitWip() {
  sizeFit(wipApi);
}
function sizeFitBom() {
  sizeFit(bomApi);
}
function sizeFitPlan() {
  sizeFit(planApi);
}

/* ===== 선택 이벤트 ===== */
function onProductSelected(e) {
  const row = (e.api.getSelectedRows?.() ?? [])[0];
  if (row?.code) loadByProductCode(row.code);
}

/* ====== 계획서 모달 ====== */
const planDialog = ref(false);
const planKeyword = ref('');
const plans = ref([
  {
    id: '1',
    seq: 1,
    planNo: 'ABC-1234',
    planName: '예방물량',
    orderNo: 'QWE-123',
    productCode: 'P001',
    productName: '블랙 데스크',
    productType: '완제품',
    createdAt: '2025-07-28',
    writer: '이동현',
    totalQty: 100,
    dueDate: '2025-08-30'
  },
  {
    id: '2',
    seq: 2,
    planNo: 'ABC-2234',
    planName: '월간생산',
    orderNo: 'QWE-125',
    productCode: 'P001',
    productName: '블랙 데스크',
    productType: '완제품',
    createdAt: '2025-07-26',
    writer: '김찬용',
    totalQty: 200,
    dueDate: '2025-08-25'
  },
  {
    id: '3',
    seq: 3,
    planNo: 'ABD-1234',
    planName: '재고보충',
    orderNo: 'QWE-128',
    productCode: 'P002',
    productName: '화이트 데스크',
    productType: '완제품',
    createdAt: '2025-06-26',
    writer: '계근영',
    totalQty: 150,
    dueDate: '2025-07-21'
  }
]);

const filteredPlans = computed(() => {
  const kw = planKeyword.value.trim().toLowerCase();
  if (!kw) return plans.value;
  return plans.value.filter(
    (r) => r.planNo.toLowerCase().includes(kw) || r.productCode.toLowerCase().includes(kw) || r.productName.toLowerCase().includes(kw)
  );
});
const pagedPlans = computed(() => filteredPlans.value);

const checkedPlanIds = ref([]);
function doPlanSearch() {}
function openPlanDialog() {
  checkedPlanIds.value = [];
  planKeyword.value = '';
  planDialog.value = true;
}
function onPlanSelectionChanged(e) {
  const selected = e.api.getSelectedRows();
  if (selected.length === 0) {
    checkedPlanIds.value = [];
    return;
  }
  const first = selected[0];
  const invalid = selected.filter((r) => r.productCode !== first.productCode || r.productType !== first.productType);
  if (invalid.length) {
    e.api.forEachNode((node) => {
      if (node.isSelected() && (node.data.productCode !== first.productCode || node.data.productType !== first.productType)) {
        node.setSelected(false);
      }
    });
    alert('같은 제품/유형만 복수 선택 가능합니다.');
  }
  checkedPlanIds.value = e.api.getSelectedRows().map((r) => r.id);
}
function applyPlans() {
  if (checkedPlanIds.value.length === 0) {
    alert('계획서를 선택하세요.');
    return;
  }
  const rows = plans.value.filter((r) => checkedPlanIds.value.includes(r.id));
  const p = rows[0];
  form.issueNumber = form.issueNumber || genIssueNo();
  form.productCode = p.productCode;
  form.productName = p.productName;
  form.dueDate = rows.map((r) => r.dueDate).sort()[0];
  form.targetQty = rows.reduce((s, r) => s + r.totalQty, 0);
  productKeyword.value = p.productCode;
  loadByProductCode(p.productCode);
  planDialog.value = false;
}

/* ===== 저장/리셋 ===== */
function submitForm() {
  if (!form.issueNumber) form.issueNumber = genIssueNo();
  if (!form.orderDate || !form.productCode || !form.productName || !form.dueDate || !form.contact?.trim()) {
    alert('필수 항목이 비어있습니다. (지시일자, 제품, 납기일자, 작성자)');
    return;
  }
  if (!form.targetQty || form.targetQty <= 0) {
    alert('목표수량을 1 이상으로 입력하세요.');
    return;
  }
  console.log('저장', { form: { ...form }, wip: wipRows.value, bom: bomRows.value, selectedPlanIds: checkedPlanIds.value });
  alert('저장(목업). 콘솔 확인!');
}
function resetForm() {
  form.issueNumber = genIssueNo();
  form.orderDate = new Date().toISOString().slice(0, 10);
  form.contact = '';
  form.productCode = '';
  form.productName = '';
  form.dueDate = '';
  form.targetQty = 10;
  wipRows.value = [];
  bomRows.value = [];
}
</script>

<style scoped>
/* 제목줄 + 버튼 */
.card-headline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.card-headline .title {
  margin: 0;
  font-weight: 600;
}

/* 2열 레이아웃 */
.main-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.pane {
  width: 100%;
}
.right-pane {
  justify-self: end;
}

.pane-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.pane-title {
  margin: 0;
}
.mt-6 {
  margin-top: 1.5rem;
}

/* AG Grid: 줄바꿈 금지 + 말줄임 */
.ag-no-wrap .ag-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* Quartz 테마 밀도 */
.ag-theme-quartz {
  --ag-font-size: 12px;
  --ag-grid-size: 4px;
}

/* 모달 본문 스크롤 */
.plan-card .dialog-body {
  max-height: 80vh;
  overflow: auto;
}
</style>
