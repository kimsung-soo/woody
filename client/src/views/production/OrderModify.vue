<!-- src/views/production/OrderModify.vue -->
<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard>
    <!-- 헤더: 제목 + 우측 삭제 -->
    <div class="card-headline">
      <h5 class="title">작업지시 수정/삭제</h5>
      <div class="head-actions">
        <v-btn class="ml-4" color="error" variant="elevated" @click="bulkDelete">삭제</v-btn>
      </div>
    </div>

    <!-- 검색 조건 (지시번호 / 제품코드 / 제품명 / 작성자) -->
    <v-row class="mb-4" dense>
      <v-col cols="3">
        <v-text-field label="지시번호" v-model.trim="searchForm.issueNumber" dense outlined hide-details @keyup.enter="applySearch" />
      </v-col>
      <v-col cols="3">
        <v-text-field label="제품코드" v-model.trim="searchForm.productCode" dense outlined hide-details @keyup.enter="applySearch" />
      </v-col>
      <v-col cols="3">
        <v-text-field label="제품명" v-model.trim="searchForm.productName" dense outlined hide-details @keyup.enter="applySearch" />
      </v-col>
      <v-col cols="3">
        <v-text-field label="작성자" v-model.trim="searchForm.contact" dense outlined hide-details @keyup.enter="applySearch" />
      </v-col>
    </v-row>

    <!-- 버튼 중앙 정렬 -->
    <v-row justify="center" class="mt-2 mb-4">
      <v-col cols="auto">
        <v-btn variant="flat" color="error" class="mx-2" @click="resetFilters">초기화</v-btn>
        <v-btn variant="flat" color="darkText" class="mx-2" @click="applySearch">검색</v-btn>
      </v-col>
    </v-row>

    <!-- 목록: 고정 높이(virtualization 유지) -->
    <div class="grid-wrap">
      <ag-grid-vue
        class="ag-theme-quartz ag-no-wrap"
        :rowData="pagedOrders"
        :columnDefs="colDefs"
        :pagination="true"
        :paginationPageSize="PAGE_SIZE"
        :suppressPaginationPanel="false"
        rowSelection="multiple"
        :rowMultiSelectWithClick="true"
        :suppressRowClickSelection="true"
        :immutableData="true"
        :getRowId="getRowId"
        :rowBuffer="3"
        @grid-ready="onGridReady"
        @row-double-clicked="openEdit"
      />
    </div>

    <!-- 편집 모달 -->
    <v-dialog v-model="edit.open" max-width="760" persistent>
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>작업지시 수정</span>
          <v-chip size="small" v-if="edit.dirty" color="warning" variant="tonal">변경됨</v-chip>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="6" md="4">
              <v-text-field label="지시번호" v-model="edit.form.issueNumber" readonly density="compact" variant="outlined" />
            </v-col>
            <v-col cols="6" md="4">
              <v-text-field
                label="지시일자"
                v-model.lazy="edit.form.orderDate"
                type="date"
                density="compact"
                variant="outlined"
                @update:modelValue="markDirty"
              />
            </v-col>
            <v-col cols="6" md="4">
              <v-text-field
                label="작성자"
                v-model.lazy="edit.form.contact"
                density="compact"
                variant="outlined"
                @update:modelValue="markDirty"
              />
            </v-col>

            <v-col cols="6" md="4">
              <v-text-field
                label="제품코드"
                v-model.lazy="edit.form.productCode"
                density="compact"
                variant="outlined"
                @update:modelValue="markDirty"
              />
            </v-col>
            <v-col cols="6" md="8">
              <v-text-field
                label="제품명칭"
                v-model.lazy="edit.form.productName"
                density="compact"
                variant="outlined"
                @update:modelValue="markDirty"
              />
            </v-col>

            <v-col cols="6" md="4">
              <v-text-field
                label="목표수량"
                v-model.number.lazy="edit.form.targetQty"
                type="number"
                min="0"
                step="1"
                density="compact"
                variant="outlined"
                @update:modelValue="markDirty"
              />
            </v-col>

            <v-col cols="12" md="8">
              <v-radio-group v-model="edit.form.productType" inline @update:modelValue="markDirty">
                <label class="v-label mr-4">제품유형</label>
                <v-radio label="완제품" value="완제품" />
                <v-radio label="반제품" value="반제품" />
              </v-radio-group>
            </v-col>

            <v-col cols="12">
              <v-text-field
                label="투입자재"
                v-model.lazy="edit.form.inputMaterial"
                placeholder="예) 합판, 철재"
                density="compact"
                variant="outlined"
                @update:modelValue="markDirty"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="flat" color="darkText" @click="closeEdit">닫기</v-btn>
          <v-btn variant="flat" color="success" @click="saveEdit">수정</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </UiParentCard>
</template>

<script setup>
import { ref, shallowRef, reactive, computed, markRaw, watch } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { AgGridVue } from 'ag-grid-vue3';

/* 헤더 */
const page = ref({ title: '작업지시 수정/삭제' });
const breadcrumbs = shallowRef([
  { title: '생산', disabled: true, href: '#' },
  { title: '작업지시 수정/삭제', disabled: false, href: '#' }
]);

/* 샘플 데이터 */
function pad2(n) {
  return String(n).padStart(2, '0');
}
function makeOrders() {
  const products = [
    { code: 'P001', name: '블랙 데스크' },
    { code: 'P002', name: '화이트 데스크' },
    { code: 'P003', name: '블랙 데스크(소형)' },
    { code: 'P004', name: '라운드 테이블' },
    { code: 'P005', name: '워런트 책상' },
    { code: 'P006', name: '메이플 책상' }
  ];
  const contacts = ['이민호', '이민우', '김찬용', '이동현', '계근영', '박지현'];
  const mats = ['합판, 철재', '목재, 나사', '재공품', '원목, 철재', '합판, 볼트'];

  return Array.from({ length: 56 }, (_, i) => {
    const p = products[i % products.length];
    const contact = contacts[i % contacts.length];
    const m = mats[i % mats.length];
    const month = 6 + (i % 3),
      day = 1 + (i % 27);
    const row = {
      id: 1000 + i,
      issueNumber: `WO-2025${pad2(month)}${pad2(day)}-${3000 + i}`,
      orderDate: `2025-${pad2(month)}-${pad2(day)}`,
      contact,
      productCode: p.code,
      productName: p.name,
      dueDate: `2025-${pad2(month)}-${pad2(((day + 15) % 28) + 1)}`,
      targetQty: 40 + (i % 12) * 10,
      inputMaterial: m,
      productType: i % 5 === 0 ? '반제품' : '완제품'
    };
    row._hay = (row.issueNumber + row.productCode + row.productName + row.contact).toLowerCase();
    return row;
  });
}
const orders = shallowRef(makeOrders());

/* 검색 폼 */
const searchForm = ref({
  issueNumber: '',
  productCode: '',
  productName: '',
  contact: ''
});
const PAGE_SIZE = 10;

/* 필터링 */
const filteredOrders = computed(() => {
  const f = searchForm.value;
  return orders.value.filter(
    (o) =>
      (!f.issueNumber || o.issueNumber.includes(f.issueNumber)) &&
      (!f.productCode || o.productCode.includes(f.productCode)) &&
      (!f.productName || o.productName.includes(f.productName)) &&
      (!f.contact || o.contact.includes(f.contact))
  );
});
const pagedOrders = computed(() => filteredOrders.value);

function applySearch() {
  // computed 기반이라 별도 로직 없음. UX용으로 첫 페이지 보이게만.
  gridApi?.ensureIndexVisible(0);
}
function resetFilters() {
  searchForm.value = { issueNumber: '', productCode: '', productName: '', contact: '' };
  gridApi?.ensureIndexVisible(0);
}

/* 컬럼 (markRaw로 고정) */
const colDefs = markRaw([
  { headerName: '', checkboxSelection: true, headerCheckboxSelection: true, width: 70 },
  { headerName: '지시번호', field: 'issueNumber', flex: 1.4, minWidth: 160, cellClass: 'cell-ellipsis' },
  { headerName: '지시일자', field: 'orderDate', flex: 0.9, minWidth: 120, cellClass: 'cell-ellipsis' },
  { headerName: '작성자', field: 'contact', flex: 0.8, minWidth: 90, cellClass: 'cell-ellipsis' },
  { headerName: '제품코드', field: 'productCode', flex: 0.9, minWidth: 110, cellClass: 'cell-ellipsis' },
  { headerName: '제품명칭', field: 'productName', flex: 1.2, minWidth: 150, cellClass: 'cell-ellipsis' },
  { headerName: '목표수량', field: 'targetQty', flex: 0.7, minWidth: 90, cellClass: 'ag-right-aligned-cell cell-ellipsis' },
  { headerName: '투입자재', field: 'inputMaterial', flex: 1.2, minWidth: 140, cellClass: 'cell-ellipsis' },
  { headerName: '제품유형', field: 'productType', flex: 0.8, minWidth: 90, cellClass: 'cell-ellipsis' }
]);

/* ag-Grid */
let gridApi = null;
function onGridReady(e) {
  gridApi = e.api;
  gridApi.sizeColumnsToFit();
}
function getRowId(params) {
  return String(params.data.id);
}

/* 편집 모달 상태 */
const edit = reactive({
  open: false,
  dirty: false,
  form: {
    id: null,
    issueNumber: '',
    orderDate: '',
    contact: '',
    productCode: '',
    productName: '',
    dueDate: '',
    targetQty: 0,
    inputMaterial: '',
    productType: '완제품'
  },
  original: null
});
function markDirty() {
  edit.dirty = true;
}

function openEdit(ev) {
  const r = ev?.data;
  if (!r) return;
  edit.form.id = r.id;
  edit.form.issueNumber = r.issueNumber;
  edit.form.orderDate = r.orderDate;
  edit.form.contact = r.contact;
  edit.form.productCode = r.productCode;
  edit.form.productName = r.productName;
  edit.form.dueDate = r.dueDate;
  edit.form.targetQty = r.targetQty;
  edit.form.inputMaterial = r.inputMaterial;
  edit.form.productType = r.productType;
  edit.original = r;
  edit.dirty = false;
  edit.open = true;
}
function closeEdit() {
  if (edit.dirty && !confirm('저장하지 않은 변경 사항이 있습니다. 닫을까요?')) return;
  edit.open = false;
}
function validateForm() {
  if (!edit.form.orderDate || !edit.form.contact?.trim() || !edit.form.productCode?.trim() || !edit.form.productName?.trim()) {
    alert('지시일자, 작성자, 제품코드, 제품명은 필수입니다.');
    return false;
  }
  if (!edit.form.targetQty || edit.form.targetQty <= 0) {
    alert('목표수량은 1 이상이어야 합니다.');
    return false;
  }
  return true;
}
function saveEdit() {
  if (!validateForm()) return;
  const updated = {
    ...edit.original,
    issueNumber: edit.form.issueNumber,
    orderDate: edit.form.orderDate,
    contact: edit.form.contact,
    productCode: edit.form.productCode,
    productName: edit.form.productName,
    dueDate: edit.form.dueDate,
    targetQty: edit.form.targetQty,
    inputMaterial: edit.form.inputMaterial,
    productType: edit.form.productType
  };
  updated._hay = (updated.issueNumber + updated.productCode + updated.productName + updated.contact).toLowerCase();

  gridApi?.applyTransactionAsync({ update: [updated] });

  const arr = orders.value;
  const idx = arr.findIndex((r) => r.id === updated.id);
  if (idx > -1) {
    arr[idx] = updated;
    orders.value = arr;
  }
  edit.open = false;
  edit.dirty = false;
  alert('수정되었습니다.');
}

function bulkDelete() {
  if (!gridApi) return;
  const selected = gridApi.getSelectedRows();
  if (!selected.length) {
    alert('삭제할 행을 선택하세요.');
    return;
  }
  if (!confirm(`${selected.length}건을 삭제하시겠습니까?`)) return;

  const ids = new Set(selected.map((r) => r.id));
  gridApi.applyTransactionAsync({ remove: selected });
  orders.value = orders.value.filter((r) => !ids.has(r.id));
  if (edit.open && edit.form.id && ids.has(edit.form.id)) edit.open = false;
  alert('삭제되었습니다.');
}

/* 검색 변경 시 첫 페이지로 스크롤 */
watch(
  searchForm,
  () => {
    gridApi?.ensureIndexVisible(0);
  },
  { deep: true }
);
</script>

<style scoped>
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
.head-actions {
  display: flex;
  align-items: center;
}

/* 고정 높이로 virtualization 유지 */
.grid-wrap {
  height: 520px;
}
.ag-theme-quartz {
  height: 100%;
}

/* 말줄임 (cellStyle 대신 클래스로) */
.cell-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ag-grid 기본 밀도 */
.ag-theme-quartz {
  --ag-font-size: 12px;
  --ag-grid-size: 4px;
}
</style>
