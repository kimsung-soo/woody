<!-- src/views/production/ProductionModify.vue -->
<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard>
    <!-- 헤더: 제목 + 우측 삭제 -->
    <div class="card-headline">
      <h5 class="title">생산계획 수정/삭제</h5>
      <div class="head-actions">
        <v-btn class="ml-4" color="error" variant="elevated" @click="bulkDelete">삭제</v-btn>
      </div>
    </div>

    <!-- 검색 조건 (계획번호 / 계획명 / 작성자 / 납기일자) -->
    <v-row class="mb-4" dense>
      <v-col cols="3">
        <v-text-field label="계획번호" v-model.trim="searchForm.planNo" dense outlined hide-details @keyup.enter="applySearch" />
      </v-col>
      <v-col cols="3">
        <v-text-field label="계획명" v-model.trim="searchForm.planName" dense outlined hide-details @keyup.enter="applySearch" />
      </v-col>
      <v-col cols="3">
        <v-text-field label="작성자" v-model.trim="searchForm.writer" dense outlined hide-details @keyup.enter="applySearch" />
      </v-col>
      <v-col cols="3">
        <v-text-field label="납기일자" v-model="searchForm.dueDate" type="date" dense outlined hide-details @keyup.enter="applySearch" />
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
        :rowData="pagedPlans"
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
          <span>생산계획 수정</span>
          <v-chip size="small" v-if="edit.dirty" color="warning" variant="tonal">변경됨</v-chip>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="6" md="4">
              <v-text-field label="계획번호" v-model="edit.form.planNo" readonly density="compact" variant="outlined" />
            </v-col>

            <v-col cols="6" md="8">
              <v-text-field
                label="계획명"
                v-model.lazy="edit.form.planName"
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

            <v-col cols="6" md="4">
              <v-text-field
                label="작성일시"
                v-model.lazy="edit.form.createdAt"
                type="datetime-local"
                density="compact"
                variant="outlined"
                @update:modelValue="markDirty"
              />
            </v-col>

            <v-col cols="6" md="4">
              <v-text-field
                label="작성자"
                v-model.lazy="edit.form.writer"
                density="compact"
                variant="outlined"
                @update:modelValue="markDirty"
              />
            </v-col>

            <v-col cols="6" md="4">
              <v-text-field
                label="납기일자"
                v-model.lazy="edit.form.dueDate"
                type="date"
                density="compact"
                variant="outlined"
                @update:modelValue="markDirty"
              />
            </v-col>

            <v-col cols="6" md="4">
              <v-text-field
                label="총 수량"
                v-model.number.lazy="edit.form.totalQty"
                type="number"
                min="0"
                step="1"
                density="compact"
                variant="outlined"
                @update:modelValue="markDirty"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                label="비고"
                v-model.lazy="edit.form.memo"
                placeholder="메모를 입력하세요"
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
const page = ref({ title: '생산계획 수정/삭제' });
const breadcrumbs = shallowRef([
  { title: '생산', disabled: true, href: '#' },
  { title: '생산계획 수정/삭제', disabled: false, href: '#' }
]);

/* 샘플 데이터 */
function pad2(n) {
  return String(n).padStart(2, '0');
}
function genPlanNo(i, m, d) {
  return `PL-2025${pad2(m)}${pad2(d)}-${1000 + i}`;
}
function makePlans() {
  const names = ['월간 생산 계획', '주간 생산 계획', '수요 대응 계획', '특별 증산 계획'];
  const writers = ['이동현', '김찬용', '김근영', '박지현', '최은수'];
  const products = ['P001', 'P002', 'P003', 'P004', 'P005'];

  return Array.from({ length: 58 }, (_, i) => {
    const m = 6 + (i % 3);
    const d = 1 + (i % 27);
    const created = `2025-${pad2(m)}-${pad2(d)}T${pad2(9 + (i % 8))}:${pad2((i * 7) % 60)}`;
    const due = `2025-${pad2(m)}-${pad2(((d + 15) % 28) + 1)}`;
    const row = {
      id: 2000 + i,
      planNo: genPlanNo(i, m, d),
      productCode: products[i % products.length],
      planName: names[i % names.length],
      createdAt: created,
      writer: writers[i % writers.length],
      dueDate: due,
      totalQty: 50 + (i % 10) * 20,
      memo: i % 4 === 0 ? '긴급 일부' : ''
    };
    row._hay = (row.planNo + row.planName + row.writer + row.productCode).toLowerCase();
    return row;
  });
}
const plans = shallowRef(makePlans());

/* 검색 폼 */
const searchForm = ref({
  planNo: '',
  planName: '',
  writer: '',
  dueDate: ''
});
const PAGE_SIZE = 10;

/* 필터링 */
const filteredPlans = computed(() => {
  const f = searchForm.value;
  return plans.value.filter(
    (o) =>
      (!f.planNo || o.planNo.includes(f.planNo)) &&
      (!f.planName || o.planName.includes(f.planName)) &&
      (!f.writer || o.writer.includes(f.writer)) &&
      (!f.dueDate || o.dueDate === f.dueDate)
  );
});
const pagedPlans = computed(() => filteredPlans.value);

function applySearch() {
  gridApi?.ensureIndexVisible(0);
}
function resetFilters() {
  searchForm.value = { planNo: '', planName: '', writer: '', dueDate: '' };
  gridApi?.ensureIndexVisible(0);
}

/* 컬럼 (markRaw로 고정) */
const colDefs = markRaw([
  { headerName: '', checkboxSelection: true, headerCheckboxSelection: true, width: 70 },
  { headerName: '계획번호', field: 'planNo', flex: 1.4, minWidth: 160, cellClass: 'cell-ellipsis' },
  { headerName: '제품코드', field: 'productCode', flex: 0.9, minWidth: 110, cellClass: 'cell-ellipsis' },
  { headerName: '계획명', field: 'planName', flex: 1.4, minWidth: 150, cellClass: 'cell-ellipsis' },
  { headerName: '작성일시', field: 'createdAt', flex: 1.2, minWidth: 160, cellClass: 'cell-ellipsis' },
  { headerName: '작성자', field: 'writer', flex: 0.8, minWidth: 90, cellClass: 'cell-ellipsis' },
  { headerName: '납기일자', field: 'dueDate', flex: 0.9, minWidth: 120, cellClass: 'cell-ellipsis' },
  { headerName: '총 수량', field: 'totalQty', flex: 0.7, minWidth: 90, cellClass: 'ag-right-aligned-cell cell-ellipsis' },
  { headerName: '비고', field: 'memo', flex: 1.2, minWidth: 140, cellClass: 'cell-ellipsis' }
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
    planNo: '',
    productCode: '',
    planName: '',
    createdAt: '',
    writer: '',
    dueDate: '',
    totalQty: 0,
    memo: ''
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
  edit.form.planNo = r.planNo; // readonly
  edit.form.productCode = r.productCode;
  edit.form.planName = r.planName;
  edit.form.createdAt = r.createdAt;
  edit.form.writer = r.writer;
  edit.form.dueDate = r.dueDate;
  edit.form.totalQty = r.totalQty;
  edit.form.memo = r.memo;
  edit.original = r;
  edit.dirty = false;
  edit.open = true;
}
function closeEdit() {
  if (edit.dirty && !confirm('저장하지 않은 변경 사항이 있습니다. 닫을까요?')) return;
  edit.open = false;
}
function validateForm() {
  if (!edit.form.planNo) return false; // 키
  if (!edit.form.planName?.trim()) return alert('계획명은 필수입니다.'), false;
  if (!edit.form.productCode?.trim()) return alert('제품코드는 필수입니다.'), false;
  if (!edit.form.createdAt) return alert('작성일시는 필수입니다.'), false;
  if (!edit.form.writer?.trim()) return alert('작성자는 필수입니다.'), false;
  if (!edit.form.dueDate) return alert('납기일자는 필수입니다.'), false;
  if (!edit.form.totalQty || edit.form.totalQty <= 0) return alert('총 수량은 1 이상이어야 합니다.'), false;
  return true;
}
function saveEdit() {
  if (!validateForm()) return;

  const updated = {
    ...edit.original,
    planNo: edit.form.planNo, // readonly 유지
    productCode: edit.form.productCode,
    planName: edit.form.planName,
    createdAt: edit.form.createdAt,
    writer: edit.form.writer,
    dueDate: edit.form.dueDate,
    totalQty: edit.form.totalQty,
    memo: edit.form.memo
  };
  updated._hay = (updated.planNo + updated.planName + updated.writer + updated.productCode).toLowerCase();

  gridApi?.applyTransactionAsync({ update: [updated] });

  const arr = plans.value;
  const idx = arr.findIndex((r) => r.id === updated.id);
  if (idx > -1) {
    arr[idx] = updated;
    plans.value = arr;
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
  plans.value = plans.value.filter((r) => !ids.has(r.id));
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
