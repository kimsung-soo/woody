<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard>
    <!-- 상단 버튼 -->
    <v-row justify="end" class="mb-2">
      <v-btn color="error" class="top_btn_ser" variant="elevated" @click="resetForm">초기화</v-btn>
      <v-btn color="primary" class="top_btn_ser" @click="saveForm">등록</v-btn>
    </v-row>

    <!-- 1) 검사기준 그리드 (체크박스=합격) -->
    <ag-grid-vue
      :rowData="criteriaRows"
      :columnDefs="criteriaCols"
      :defaultColDef="defaultColDef"
      :rowSelection="rowSelection"
      :selectionColumnDef="selectionColumnDef"
      :gridOptions="criteriaGridOptions"
      :theme="quartz"
      style="height: 280px; width: 100%"
      @grid-ready="onCriteriaReady"
      @first-data-rendered="selectAllCriteria"
      @selection-changed="recalcCriteria"
    />

    <!-- 최종처리 -->
    <v-row class="my-4">
      <v-col cols="12" class="py-1">
        <div class="d-flex align-center">
          <h5 class="mr-4">최종처리</h5>
          <v-chip :color="finalStatus === '합격' ? 'primary' : 'error'">{{ finalStatus }}</v-chip>
          <span class="ml-auto text-caption">선택 {{ selectedCount }}/{{ totalCount }}</span>
        </div>
      </v-col>
    </v-row>

    <!-- 2) 하단 입력 그리드(1행) -->
    <ag-grid-vue
      :rowData="detailRows"
      :columnDefs="detailCols"
      :gridOptions="detailGridOptions"
      :theme="quartz"
      style="height: 160px; width: 100%"
    />
    <!-- 처리상태가 불합격으로 판정나면 불량 사유를 기입하는 란을 생성 (미완성)-->
    <p v-if="finalStatus='합격'" >
      <table>
        <th>불합격사유</th>
        <td>
          <tr>기록란</tr>
        </td>
      </table> </p>
    <p v-else-if="finalStatus='불합격'">
    합격</p>
  </UiParentCard>
</template>

<script setup>
import { ref, shallowRef, computed } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

import { AgGridVue } from 'ag-grid-vue3';
import { ModuleRegistry, themeQuartz, ClientSideRowModelModule, RowSelectionModule, ValidationModule } from 'ag-grid-community';

// 모듈 등록 (개발 모드에서만 Validation)
ModuleRegistry.registerModules([ClientSideRowModelModule, RowSelectionModule, ...(import.meta.env.PROD ? [] : [ValidationModule])]);

const quartz = themeQuartz;

/* breadcrumb */
const page = ref({ title: '제품 검수관리 등록' });
const breadcrumbs = ref([
  { title: '품질', disabled: true, href: '#' },
  { title: '제품 검수관리 등록', disabled: false, href: '#' }
]);

/* ------------ 1) 검사기준 그리드 (선택=합격) ------------ */
// 행 데이터 (rowId로 쓸 고유 키 _id 포함)
const criteriaRows = ref([
  { _id: 'moisture', label: '함수율', allow: '수분 함량 12~15% (KS범위)', value: '' },
  { _id: 'moisture', label: '치수정밀도', allow: '입고자재 ±2mm 이내', value: '' },
  { _id: 'moisture', label: '강도/내구성', allow: '횡강도 35MPa 이상', value: '' },
  { _id: 'appearance', label: '안정성', allow: '전도 없음, 전기부 안전, 모서리 등금 위험요소 없음', value: '' },
  { _id: 'thickness', label: '왼관 결점', allow: '옹이, 할렬, 긁힘 육안확인 시 결점이 없을 시', value: '' },
  { _id: 'strength', label: '포름알데히드 방출률', allow: '친환경 E0 등급(0.3mg/L)이하', value: '' },
  { _id: 'surface', label: '표면 마감/도장', allow: '도맏 들뜸 박리 없음, 균일한 색상 광택 유지', value: '' }
]);

const criteriaApi = shallowRef(null);

const defaultColDef = ref({ resizable: true, minWidth: 120, sortable: false });

const rowSelection = ref({ mode: 'multiRow' });

const selectionColumnDef = ref({
  headerName: '판정',
  pinned: 'right',
  width: 90,
  headerCheckboxSelection: true,
  headerCheckboxSelectionCurrentPageOnly: false,
  checkboxSelection: true,
  suppressHeaderMenuButton: true
});

const criteriaCols = ref([
  { headerName: '검사기준', field: 'label', minWidth: 160, flex: 1 },
  { headerName: '허용수치', field: 'allow', minWidth: 360, flex: 2 },
  { headerName: '측정값', field: 'value', minWidth: 360, flex: 2, editable: true },
  {
    headerName: '판정',
    colId: 'result',
    minWidth: 120,
    maxWidth: 140,
    valueGetter: (p) => (p.node?.isSelected() ? '합격' : '불합격'),
    cellClass: (p) => (p.value == '합격' ? 'ag-cell-success' : 'ag-cell-error'),
    sortable: false
  }
]);

const criteriaGridOptions = ref({
  defaultColDef: defaultColDef.value
});

// 합격/불합격 계산
const totalCount = ref(0);
const selectedCount = ref(0);
const finalStatus = computed(() => (selectedCount.value == totalCount.value ? '합격' : '불합격'));

function onCriteriaReady(e) {
  criteriaApi.value = e.api;
}

function selectAllCriteria(e) {
  // 기본값: 전부 합격(전체 선택)
  const nodes = [];
  e.api.forEachNode((n) => nodes.push(n));
  e.api.setNodesSelected({ nodes, newValue: true });
  recalcCriteria();
}

function recalcCriteria() {
  const api = criteriaApi.value;
  if (!api) return;
  totalCount.value = api.getDisplayedRowCount();
  selectedCount.value = api.getSelectedNodes().length;
  api.refreshCells({ columns: ['result'], force: true });
}

/* ------------ 2) 하단 입력 그리드(1행) ------------ */
const detailRows = ref([
  {
    certid: '(자동입력)',
    proCode: '(자동입력)',
    prdName: '(자동입력)',
    totalQty: 40,
    passQty: 30,
    writer: '사람1',
    writeDate: '2025-07-30',
    doneDate: '2025-07-30'
  }
]);

const detailCols = ref([
  { headerName: '제품검사번호', field: 'id', width: 170, editable: false },
  { headerName: '제품코드', field: 'inNo', width: 140, editable: false },
  { headerName: '제품명', field: 'materialCode', width: 150, editable: false },
  { headerName: '합격품수량', field: 'materialName', width: 160, editable: false },
  { headerName: '총수량', field: 'totalQty', width: 110, editable: true, valueParser: numParser },
  { headerName: '작성자', field: 'writer', width: 120, editable: true },
  { headerName: '입고일자', field: 'inDate', width: 140, editable: true },
  { headerName: '검사완료일자', field: 'doneDate', width: 140, editable: true }
]);

function numParser(p) {
  const v = Number(String(p.newValue).replace(/,/g, '').trim());
  return Number.isFinite(v) ? v : p.oldValue;
}

const detailGridOptions = ref({
  defaultColDef: { resizable: true, minWidth: 110 },
  autoSizeStrategy: { type: 'fitGridWidth' }
});

/* ------------ 버튼 로직 ------------ */
function resetForm() {
  // 검사기준: 전부 불합격(선택 해제)
  const api = criteriaApi.value;
  if (api) {
    const nodes = [];
    api.forEachNode((n) => nodes.push(n));
    api.setNodesSelected({ nodes, newValue: false });
    recalcCriteria();
  }
  // 하단 디테일 초기화
  const r = detailRows.value[0];
  r.totalQty = 0;
  r.passQty = 0;
  r.user = '';
  r.inDate = '';
  r.doneDate = '';
}

function saveForm() {
  const api = criteriaApi.value;
  if (!api) return;
  const criteria = criteriaRows.value.map((r) => {
    const node = api.getRowNode(r._id);
    return { key: r._id, label: r.label, pass: !!node?.isSelected() };
  });

  const d = detailRows.value[0];
  if (d.passQty > d.totalQty) return alert('합격수량이 총수량을 초과할 수 없습니다.');

  console.log('payload', {
    criteria, // 각 항목 합격 여부
    status: finalStatus.value, // 최종처리 (합/불)
    detail: d
  });
  alert('등록되었습니다! (콘솔 payload 확인)');
}

</script>

<style scoped>
.top_btn_ser {
  margin-left: 8px;
}
.fw-600 {
  font-weight: 600;
}
.mr-4 {
  margin-right: 16px;
}
.ml-auto {
  margin-left: auto;
}
.ag-cell-success {
  font-weight: 600;
}
.ag-cell-error {
  color: #d32f2f;
  font-weight: 600;
}
</style>
