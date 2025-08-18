<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="설비 정보수정">
    <v-row class="mb-2 py-0">
      <v-col cols="12" class="d-flex align-center">
        <v-btn color="warning" variant="flat" @click="openModal('공정 조회', RowData, ColDefs)">공정 조회</v-btn>
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

const page = ref({ title: '설비 상태관리' });
const breadcrumbs = shallowRef([
  { title: '설비 상태', disabled: true, href: '#' },
  { title: '전체 조회', disabled: false, href: '#' }
]);

/* 네 환경(프리픽스 없음) */
const apiBase = 'http://localhost:3000';

/* ---------- 설비유형 코드(FAC_TYPE) 맵 ---------- */
let facTypeMap = new Map();
const fetchFacTypeCodes = async () => {
  const { data } = await axios.get(`${apiBase}/common/codes/FAC_TYPE`);
  const map = new Map();
  for (const r of data || []) {
    map.set(r.code ?? r.CODE, r.code_name ?? r.CODE_NAME);
  }
  facTypeMap = map;
};

/* Grid */
const processCode = ref('');
const defaultColDef = { editable: false, sortable: true, resizable: true };
const gridApi = ref(null);
const onGridReady = async (e) => {
  gridApi.value = e.api;
  await init();
};

/* 공정코드  */
const applyProcessFilter = (procCode) => {
  if (!gridApi.value) return;
  gridApi.value.setFilterModel({
    공정코드: { filterType: 'text', type: 'equals', filter: procCode || '' }
  });
  gridApi.value.onFilterChanged();
};

const statusText = (s) => ({ 0: '가동', 1: '비가동', 2: '점검중' })[Number(s)] ?? String(s);
const statusStyle = (v) => {
  if (v === '가동') return { color: 'blue', fontWeight: 'bold' };
  if (v === '비가동') return { color: 'red', fontWeight: 'bold' };
  return null;
};
const fmt = (v) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '');

/* 컬럼 정의 */
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

const rows = ref([]);

/* ===== DB 연동 ===== */

/** 설비 전체  */
const fetchFacilities = async () => {
  const { data } = await axios.get(`${apiBase}/facility`);
  return data || [];
};

/** 설비 상태 목록 */
const fetchStatusList = async () => {
  try {
    const { data } = await axios.get(`${apiBase}/facility/status`);
    return data || [];
  } catch {
    return [];
  }
};

const statusTime = (r) => new Date(r.FS_CHECKDAY || r.DOWN_ENDDAY || r.DOWN_STARTDAY || 0).getTime();

const mergeFacilitiesWithStatus = (facilities, statusRows) => {
  const sMap = new Map();
  for (const r of statusRows || []) {
    const prev = sMap.get(r.FAC_ID);
    if (!prev || statusTime(r) >= statusTime(prev)) sMap.set(r.FAC_ID, r);
  }

  return (facilities || []).map((f) => {
    const s = sMap.get(f.FAC_ID);
    const st = s ? statusText(s.FS_STATUS) : '가동';
    const isUp = st === '가동';

    const facTypeName = f.FAC_TYPE_NM ?? (f.FAC_TYPE ? facTypeMap.get(String(f.FAC_TYPE)) || f.FAC_TYPE : '-');
    return {
      공정코드: f.PR_ID || '',
      설비코드: f.FAC_ID,
      설비명: f.FAC_NAME || '',
      설비유형: facTypeName,
      설비상태: st,
      비가동사유: isUp ? '-' : s?.FS_REASON || '-',
      점검완료일: isUp ? '-' : fmt(s?.FS_CHECKDAY),
      다음점검일: isUp ? '-' : fmt(s?.FS_NEXTDAY),
      담당자: f.MANAGER && f.MANAGER !== '-' ? f.MANAGER : s?.MANAGER || '-'
    };
  });
};

/*설비유형 코드표  */
const init = async () => {
  await fetchFacTypeCodes();
  const [facilities, statusRows] = await Promise.all([fetchFacilities(), fetchStatusList()]);
  rows.value = mergeFacilitiesWithStatus(facilities, statusRows);
  if (processCode.value) applyProcessFilter(processCode.value);
};

/*  공정 조회 모달  */
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
