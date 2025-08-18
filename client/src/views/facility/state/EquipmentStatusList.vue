<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="설비 정보수정">
    <v-row class="mb-2 py-0">
      <v-col cols="12" class="d-flex align-center">
        <v-btn color="warning" variant="flat" @click="openModal('공정 조회', RowData, ColDefs)"> 공정 조회 </v-btn>
      </v-col>
    </v-row>

    <v-row class="mb-4 pt-0">
      <v-col cols="12" md="6">
        <v-text-field label="공정코드" v-model="processCode" readonly hide-details density="comfortable" variant="outlined" />
      </v-col>
    </v-row>

    <!-- AG Grid -->
    <ag-grid-vue
      style="height: 420px"
      :theme="quartz"
      :rowData="rows"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :animateRows="true"
      :suppressClickEdit="true"
      @grid-ready="onGridReady"
    />
  </UiParentCard>

  <!-- 공정 조회 모달 -->
  <MoDal ref="modalRef" :title="modalTitle" :rowData="modalRowData" :colDefs="modalColDefs" @confirm="modalConfirm" />
</template>

<script setup>
import { ref, shallowRef } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

import { AgGridVue } from 'ag-grid-vue3';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import axios from 'axios';
import dayjs from 'dayjs';
import MoDal from '@/views/common/NewModal.vue';

ModuleRegistry.registerModules([AllCommunityModule]);
const quartz = themeQuartz;

/* 페이지 헤더 */
const page = ref({ title: '설비 상태관리' });
const breadcrumbs = shallowRef([
  { title: '설비 상태', disabled: true, href: '#' },
  { title: '전체 조회', disabled: false, href: '#' }
]);

/* API 베이스 */
const apiBase = 'http://localhost:3000';

/* Grid 기본 */
const processCode = ref('');
const defaultColDef = { editable: false, sortable: true, resizable: true };
const gridApi = ref(null);
const onGridReady = async (e) => {
  gridApi.value = e.api;
  await init();
};

/* 공정코드 필터 */
const applyProcessFilter = (procCode) => {
  if (!gridApi.value) return;
  gridApi.value.setFilterModel({
    공정코드: { filterType: 'text', type: 'equals', filter: procCode || '' }
  });
  gridApi.value.onFilterChanged();
};

/* 상태 텍스트/색상 + 포맷 */
const statusText = (s) => ({ 0: '가동', 1: '비가동', 2: '점검중' })[Number(s)] ?? String(s);
const statusStyle = (v) => {
  if (v === '가동') return { color: 'blue', fontWeight: 'bold' };
  if (v === '비가동') return { color: 'red', fontWeight: 'bold' };
  return null;
};
const fmt = (v) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '');

/* 컬럼 정의 (레이아웃 유지) */
const columnDefs = ref([
  { field: '공정코드', hide: true, filter: 'agTextColumnFilter' },
  { field: '설비코드', flex: 1 },
  { field: '설비명', flex: 1 },
  { field: '설비유형', flex: 1 },
  {
    field: '설비상태',
    flex: 1,
    cellStyle: (p) => statusStyle(p.value)
  },
  { field: '비가동사유', flex: 1 },
  { field: '점검완료일', flex: 1 },
  { field: '다음점검일', flex: 1 },
  { field: '담당자', flex: 1 }
]);

/* 목록 데이터 (그리드) */
const rows = ref([]);

/* ---------- 데이터 로드 ---------- */

/** 설비 메타 목록: FAC_ID -> { PR_ID, FAC_TYPE } */
const fetchFacilityMeta = async () => {
  const { data } = await axios.get(`${apiBase}/facility`);
  const map = new Map();
  for (const r of data || []) {
    map.set(r.FAC_ID, { PR_ID: r.PR_ID || '', FAC_TYPE: r.FAC_TYPE || '' });
  }
  return map;
};

/** 설비 상태 목록 (없을 수 있으니 try/catch) */
const fetchStatusList = async () => {
  try {
    const { data } = await axios.get(`${apiBase}/facility/status`);
    return data || [];
  } catch {
    return []; // 상태 라우터 미구현/빈 테이블 대비
  }
};

/** FACILITY 전체 목록 (폴백용) */
const fetchFacilities = async () => {
  const { data } = await axios.get(`${apiBase}/facility`);
  return data || [];
};

/** 상태 + 메타 → 그리드 행 */
const composeRows = (statusRows, facMetaMap) =>
  statusRows.map((r) => {
    const meta = facMetaMap.get(r.FAC_ID) || {};
    return {
      공정코드: meta.PR_ID || '',
      설비코드: r.FAC_ID,
      설비명: r.FAC_NAME || '',
      설비유형: meta.FAC_TYPE || r.FS_TYPE_NM || r.FS_TYPE || '-', // 메타 우선
      설비상태: statusText(r.FS_STATUS),
      비가동사유: r.FS_REASON || '-',
      점검완료일: fmt(r.FS_CHECKDAY),
      다음점검일: fmt(r.FS_NEXTDAY),
      담당자: r.MANAGER || '-'
    };
  });

/** 상태 없을 때 FACILITY만으로 행 구성 (폴백) */
const composeRowsFromFacilities = (facilities) =>
  (facilities || []).map((f) => ({
    공정코드: f.PR_ID || '',
    설비코드: f.FAC_ID,
    설비명: f.FAC_NAME || '',
    설비유형: f.FAC_TYPE || '-',
    설비상태: '가동', // 기본 표시값 (원하면 '-'로 바꿔도 됨)
    비가동사유: '-',
    점검완료일: f.FAC_CHECKDAY ? fmt(f.FAC_CHECKDAY) : '',
    다음점검일: '',
    담당자: f.MANAGER || '-'
  }));

/** 초기 로드 */
const init = async () => {
  const [facMetaMap, statusRows, facilities] = await Promise.all([fetchFacilityMeta(), fetchStatusList(), fetchFacilities()]);

  rows.value = statusRows.length > 0 ? composeRows(statusRows, facMetaMap) : composeRowsFromFacilities(facilities);

  if (processCode.value) applyProcessFilter(processCode.value);
};

/* ========= 공정 조회 모달 ========= */
const modalRef = ref(null);
const modalTitle = ref('');
const modalRowData = ref([]);
const modalColDefs = ref([]);

const ColDefs = [
  { field: '공정코드', headerName: '공정코드', flex: 1 },
  { field: '공정명', headerName: '공정명', flex: 1 },
  { field: '설비유형', headerName: '설비유형', flex: 1 },
  { field: '등록일자', headerName: '등록일자', flex: 1, type: 'date' }
];

const RowData = ref([
  { 공정코드: 'PRC-001', 공정명: '재단 공정', 설비유형: '절단기', 등록일자: '2025-07-01' },
  { 공정코드: 'PRC-002', 공정명: '연마 공정', 설비유형: '연마기', 등록일자: '2025-07-05' },
  { 공정코드: 'PRC-003', 공정명: '조립 공정', 설비유형: '조립대', 등록일자: '2025-07-10' }
]);

const openModal = (title, rowData, colDefs) => {
  modalTitle.value = title;
  modalRowData.value = rowData;
  modalColDefs.value = colDefs;
  modalRef.value?.open();
};

const modalConfirm = (selectedRow) => {
  if (!selectedRow) return;
  processCode.value = selectedRow.공정코드 || '';
  applyProcessFilter(processCode.value);
};
</script>
