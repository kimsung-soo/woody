<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="설비 수리관리">
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

    <ag-grid-vue
      style="height: 240px"
      :theme="quartz"
      :rowData="rows"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :animateRows="true"
      :suppressClickEdit="true"
      rowSelection="single"
      @grid-ready="onGridReady"
      @row-clicked="onPick"
    />

    <MoDal ref="modalRef" :title="modalTitle" :rowData="modalRowData" :colDefs="modalColDefs" @confirm="modalConfirm" />

    <v-card v-if="form.code" class="mt-6 pa-4">
      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field label="설비코드" v-model="form.code" dense outlined readonly />
          <v-text-field label="설비명" v-model="form.name" dense outlined readonly />
          <v-text-field label="설비유형" v-model="form.type" dense outlined readonly />
          <v-text-field label="고장유형" v-model="form.err" dense outlined readonly />
          <v-text-field label="수리내역" v-model="form.note" dense outlined />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field label="비가동 시작일" v-model="form.repairStart" dense outlined readonly />
          <v-text-field label="수리 완료일" v-model="form.repairEnd" dense outlined readonly />
          <v-text-field label="담당자" v-model="form.manager" dense outlined />
          <v-text-field label="비고" v-model="form.remark" dense outlined />
          <div class="text-right mt-2">
            <v-btn color="primary" @click="completeRepair">수리완료</v-btn>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </UiParentCard>
</template>

<script setup>
import { ref, reactive, shallowRef, onMounted, watch } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { AgGridVue } from 'ag-grid-vue3';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
const quartz = themeQuartz;

import axios from 'axios';

/** 환경: .env 있으면 사용, 없으면 /api 기본 */
const apiBase = import.meta?.env?.VITE_API_BASE || '/api';

/* 페이지 헤더(그대로) */
const page = ref({ title: '설비 수리관리' });
const breadcrumbs = shallowRef([
  { title: '설비', disabled: true, href: '#' },
  { title: '수리관리', disabled: false, href: '#' }
]);

/* 공정코드 필터(그대로) */
const processCode = ref('');
const gridApi = ref(null);
const onGridReady = (e) => (gridApi.value = e.api);
const applyProcessFilter = (procCode) => {
  if (!gridApi.value) return;
  gridApi.value.setFilterModel({
    공정코드: { filterType: 'text', type: 'equals', filter: procCode || '' }
  });
  gridApi.value.onFilterChanged();
};

/* 컬럼 정의(그대로) */
const columnDefs = ref([
  { field: '공정코드', hide: true, filter: 'agTextColumnFilter' },
  { field: '설비코드', flex: 1 },
  { field: '설비명', flex: 1 },
  { field: '설비유형', flex: 1 },
  { field: '설비상태', flex: 1 },
  { field: '비가동사유', flex: 1 },
  { field: '고장유형', flex: 1 },
  { field: '비가동시작시간', flex: 1 },
  { field: '담당자', flex: 1 }
]);
const defaultColDef = { editable: false, sortable: true, resizable: true };

/* ================= DB 연동 ================= */

/** 설비 메타(FACILITY) */
const fetchFacilities = async () => {
  const { data } = await axios.get(`${apiBase}/facility`);
  return Array.isArray(data) ? data : [];
};

/** 설비상태(FACILITY_STATUS) 전체 */
const fetchStatusList = async () => {
  const { data } = await axios.get(`${apiBase}/facility/status`);
  return Array.isArray(data) ? data : [];
};

/** 행 매핑: 상태 + 설비메타 → 표 컬럼 + 내부필드 */
const rows = ref([]);
const composeRows = (statusRows, facilities) => {
  const facMap = new Map(facilities.map((f) => [f.FAC_ID, f]));

  // === 고장 비가동만 남김 ===
  const isNotEnded = (s) => !s.END_TIME && !s.DOWN_ENDDAY;
  const openDowns = statusRows.filter((s) => Number(s.FS_STATUS) === 1 && isNotEnded(s) && (s.FS_REASON || '') === '고장');

  return openDowns.map((s) => {
    const f = facMap.get(s.FAC_ID) || {};
    return {
      // 화면 표기
      공정코드: f.PR_ID || '',
      설비코드: s.FAC_ID,
      설비명: s.FAC_NAME || f.FAC_NAME || '',
      설비유형: f.FAC_TYPE || '-',
      설비상태: '비가동',
      비가동사유: s.FS_REASON || '고장',
      고장유형: s.FS_TYPE_NM || '-', // code_master.code_name
      비가동시작시간: s.DOWN_STARTDAY ? fmt(s.DOWN_STARTDAY) : '-',
      담당자: (s.MANAGER ?? s.FS_MANAGER ?? s.MGR ?? '').toString() || (f.MANAGER ?? '-') || '-',

      // 내부(숨김): 완료 호출에 필요
      _fsId: s.FS_ID,
      _fsType: s.FS_TYPE || null
    };
  });
};

/** 초기 로드 */
const init = async () => {
  try {
    const [facilities, statusRows] = await Promise.all([fetchFacilities(), fetchStatusList()]);
    rows.value = composeRows(statusRows, facilities);
    if (processCode.value) applyProcessFilter(processCode.value);
  } catch (e) {
    console.error(e);
    rows.value = [];
  }
};

/* =============== 상세 폼(그대로) =============== */
const form = reactive({
  code: '',
  name: '',
  type: '',
  err: '',
  manager: '',
  repairStart: '',
  repairEnd: '',
  note: '',
  remark: '',
  // 내부
  _fsId: null
});

// 선택된 행의 인덱스(담당자 즉시 반영용)
const selectedRowIndex = ref(-1);

const onPick = (e) => {
  const d = e.data;
  selectedRowIndex.value = e.rowIndex ?? -1;

  form.code = d.설비코드;
  form.name = d.설비명;
  form.type = d.설비유형;
  form.err = d.고장유형;
  form.manager = d.담당자 === '-' ? '' : d.담당자;
  form.repairStart = d.비가동시작시간 || now();
  form.repairEnd = ''; // ★ 완료시간은 비워둠(이미 있으면 덮지 않기 위해)
  form.note = '';
  form.remark = '';
  form._fsId = d._fsId || null;
};

/* 폼의 담당자 입력을 그리드에 즉시 반영 */
watch(
  () => form.manager,
  (val) => {
    if (selectedRowIndex.value > -1 && rows.value[selectedRowIndex.value]) {
      rows.value[selectedRowIndex.value].담당자 = (val || '').trim() || '-';
    }
  }
);

/* =============== 수리 완료 =============== */
const completeRepair = async () => {
  if (!form._fsId) return alert('선택된 비가동 건이 없습니다.');
  if (!form.note || !form.note.trim()) {
    return alert('수리내역을 입력해 주세요.'); // ← 필수: 자동문구 생성 금지
  }
  // 이미 완료된 건이면 재처리 금지
  if (form.repairEnd && form.repairEnd.trim() !== '') {
    return alert('이미 수리 완료 처리된 건입니다.');
  }

  // 완료 시간은 최초 1회만 세팅
  const endAt = form.repairEnd || now();
  form.repairEnd = endAt;

  // 상태 종료 + 히스토리 누적(백엔드가 MANAGER 받으면 같이 업데이트)
  await axios.patch(`${apiBase}/facility/status/end`, {
    FS_ID: form._fsId,
    endTime: endAt, // 상태 종료시간
    restoreStatus: 0, // 가동 복귀
    checkTime: endAt, // 필요 시 별도 필드 구성
    repairContent: form.note, // 히스토리 누적(사용자 입력만 저장)
    repairNote: form.remark || null,
    MANAGER: (form.manager || '').trim() || null
  });

  // 같은 건을 다시 완료 못 하도록 비활성 처리
  form._fsId = null;

  // 목록 갱신 & 카드 닫기(원하면 유지 가능)
  await init();
  form.code = ''; // 카드 닫기(다시 열면 새 선택 기준)
  alert('수리 완료 처리되었습니다.');
};

/* 유틸 */
function now() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
function fmt(v) {
  const d = new Date(v);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/* 공정 조회 모달(그대로) */
import MoDal from '@/views/common/NewModal.vue';
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

onMounted(init);
</script>
