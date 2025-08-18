<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="비가동 관리">
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
      class="ag-theme-quartz grid-clean"
      style="height: 260px"
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

    <!-- 공정 조회 모달 -->
    <MoDal ref="modalRef" :title="modalTitle" :rowData="modalRowData" :colDefs="modalColDefs" @confirm="modalConfirm" />

    <!-- 상세/조작 -->
    <v-card v-if="detail.code" class="mt-6 pa-4">
      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field label="설비코드" v-model="detail.code" dense outlined readonly />
          <v-text-field label="설비명" v-model="detail.name" dense outlined readonly />
          <v-text-field label="설비유형" v-model="detail.type" dense outlined readonly />
          <v-text-field label="비가동 시작일시" v-model="detail.downStart" dense outlined readonly />
          <v-text-field class="mt-2" label="비가동 완료일시" v-model="detail.downEnd" dense outlined readonly />
        </v-col>

        <v-col cols="12" md="6">
          <v-label class="mb-1 d-block">상태 선택</v-label>
          <v-radio-group v-model="detail.targetStatus" inline>
            <v-radio label="가동" value="가동" />
            <v-radio label="비가동" value="비가동" />
          </v-radio-group>

          <v-label class="mb-1 d-block">비가동 사유</v-label>
          <v-radio-group v-model="detail.downReason" inline :disabled="detail.targetStatus !== '비가동'">
            <v-radio label="고장" value="고장" />
            <v-radio label="점검" value="점검" />
          </v-radio-group>

          <v-label class="mb-1 d-block">고장 유형</v-label>
          <v-radio-group v-model="detail.errType" inline :disabled="detail.targetStatus !== '비가동' || detail.downReason !== '고장'">
            <v-radio v-for="opt in rrOptions" :key="opt.code" :label="opt.code_name" :value="opt.code" />
          </v-radio-group>

          <div class="text-right mt-2">
            <v-btn color="error" :disabled="detail.targetStatus !== '비가동'" @click="setDown"> 비가동 </v-btn>
            <v-btn class="ml-2" color="primary" :disabled="detail.targetStatus !== '가동'" @click="setUp"> 가동 </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </UiParentCard>
</template>

<script setup>
import { ref, reactive, shallowRef } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

import { AgGridVue } from 'ag-grid-vue3';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import axios from 'axios';
ModuleRegistry.registerModules([AllCommunityModule]);
const quartz = themeQuartz;

/* 헤더 */
const page = ref({ title: '비가동 관리' });
const breadcrumbs = shallowRef([
  { title: '설비', disabled: true, href: '#' },
  { title: '비가동 관리', disabled: false, href: '#' }
]);

/* API base */
const apiBase = 'http://localhost:3000';

/* 공정 equals 필터 */
const processCode = ref('');
const gridApi = ref(null);
const onGridReady = async (e) => {
  gridApi.value = e.api;
  await init();
};
const applyProcessFilter = (procCode) => {
  if (!gridApi.value) return;
  gridApi.value.setFilterModel({ 공정코드: { filterType: 'text', type: 'equals', filter: procCode || '' } });
  gridApi.value.onFilterChanged();
};

/* Grid 컬럼 */
const columnDefs = ref([
  { field: '공정코드', hide: true, filter: 'agTextColumnFilter' },
  { field: '설비코드', flex: 1 },
  { field: '설비명', flex: 1 },
  { field: '설비유형', flex: 1 },
  {
    field: '설비상태',
    flex: 1,
    cellStyle: (p) =>
      p.value === '가동' ? { color: 'blue', fontWeight: 'bold' } : p.value === '비가동' ? { color: 'red', fontWeight: 'bold' } : null
  },
  { field: '비가동사유', flex: 1 },
  { field: '고장유형', flex: 1 },
  { field: '비가동시작시간', flex: 1 },
  { field: '담당자', flex: 1 }
]);
const defaultColDef = { editable: false, sortable: true, resizable: true, suppressHeaderMenuButton: true };

/* 표시용 행들 */
const rows = ref([]);

/* 상세/조작 상태 */
const detail = reactive({
  code: '',
  name: '',
  type: '',
  targetStatus: '비가동',
  downReason: '',
  errType: '',
  downStart: '',
  downEnd: '',
  // 내부용
  _fsId: null, // 현재 선택 행의 FS_ID
  _downEnd: null
});

/* 고장유형 옵션*/
const rrOptions = ref([]);
const fetchRRCodes = async () => {
  try {
    const { data } = await axios.get(`${apiBase}/common/codes/RR`);
    rrOptions.value = Array.isArray(data) ? data : [];
  } catch {
    rrOptions.value = [];
  }
};

// 설비 메타
const fetchFacilities = async () => {
  const { data } = await axios.get(`${apiBase}/facility`);
  return data || [];
};

// 설비 상태
const fetchStatusList = async () => {
  try {
    const { data } = await axios.get(`${apiBase}/facility/status`);
    return data || [];
  } catch {
    return [];
  }
};

// 행 변환
const composeRows = (statusRows, facilities) => {
  const facMap = new Map(facilities.map((f) => [f.FAC_ID, f]));
  return (statusRows || []).map((s) => {
    const f = facMap.get(s.FAC_ID) || {};
    const statusText = { 0: '가동', 1: '비가동', 2: '점검중' }[Number(s.FS_STATUS)] ?? String(s.FS_STATUS);
    return {
      공정코드: f.PR_ID || '',
      설비코드: s.FAC_ID,
      설비명: s.FAC_NAME || f.FAC_NAME || '',
      설비유형: f.FAC_TYPE_NM || s.FS_TYPE_NM || s.FS_TYPE || f.FAC_TYPE || '-',
      설비상태: statusText,
      비가동사유: s.FS_REASON || '-',
      고장유형: s.FS_TYPE_NM || '-',
      비가동시작시간: s.DOWN_STARTDAY ? fmt(s.DOWN_STARTDAY) : '-',
      담당자: s.MANAGER || '-',

      _fsId: s.FS_ID || null,
      _fsStatus: s.FS_STATUS,
      _downEnd: s.DOWN_ENDDAY,
      _fsType: s.FS_TYPE || null // ← 실제 코드값('01'~'04')
    };
  });
};

// 상태 없을 때 FACILITY만으로 표 구성 (폴백)
const composeRowsFromFacilities = (facilities) =>
  (facilities || []).map((f) => ({
    공정코드: f.PR_ID || '',
    설비코드: f.FAC_ID,
    설비명: f.FAC_NAME || '',
    설비유형: f.FAC_TYPE || '-',
    설비상태: '가동',
    비가동사유: '-',
    고장유형: '-',
    비가동시작시간: '-',
    담당자: f.MANAGER || '-',
    _fsId: null,
    _fsStatus: 0,
    _downEnd: null,
    _fsType: null
  }));

const fmt = (v) => {
  const d = new Date(v);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

const init = async () => {
  const [facilities, statusRows] = await Promise.all([fetchFacilities(), fetchStatusList()]);
  rows.value = statusRows.length > 0 ? composeRows(statusRows, facilities) : composeRowsFromFacilities(facilities);
  await fetchRRCodes();
  if (processCode.value) applyProcessFilter(processCode.value);
};

/* 행 선택  */
const onPick = (e) => {
  const d = e.data;
  detail.code = d.설비코드;
  detail.name = d.설비명;
  detail.type = d.설비유형;
  detail.targetStatus = d.설비상태 === '비가동' ? '가동' : '비가동';
  detail.downReason = d.비가동사유 !== '-' ? d.비가동사유 : '';
  detail.errType = d._fsType || '';
  detail.downStart = d.비가동시작시간 !== '-' ? d.비가동시작시간 : '';
  detail.downEnd = '';
  detail._fsId = d._fsId || null;
  detail._fsStatus = d._fsStatus || 0;
};

const setDown = async () => {
  if (detail.targetStatus !== '비가동') return;
  if (!detail.code) return;

  // 필수값 검증
  if (!detail.downReason) return alert('비가동 사유를 선택하세요.');
  if (detail.downReason === '고장' && !detail.errType) return alert('고장 유형을 선택하세요.');

  if (!confirm('비가동으로 변경할까요?')) return;

  const nowStr = now();

  try {
    if (detail._fsId) {
      // ✅ 기존 상태행이 있는 경우 → 업데이트
      await axios.patch(`${apiBase}/facility/status/down`, {
        FS_ID: detail._fsId,
        FS_STATUS: 1,
        FS_REASON: detail.downReason,
        FS_TYPE: detail.downReason === '고장' ? detail.errType : null,
        DOWN_STARTDAY: nowStr,
        FS_CHECKDAY: nowStr,
        FS_NEXTDAY: null,
        MANAGER: detail.manager || '-'
      });
    } else {
      // ✅ 상태행이 없는 경우 → 신규 생성
      await axios.post(`${apiBase}/facility/status`, {
        FAC_ID: detail.code,
        FS_STATUS: 1,
        FS_REASON: detail.downReason,
        FS_TYPE: detail.downReason === '고장' ? detail.errType : null,
        DOWN_STARTDAY: nowStr,
        FS_CHECKDAY: nowStr,
        FS_NEXTDAY: null,
        MANAGER: detail.manager || '-'
      });
    }

    detail.downStart = nowStr;
    detail.downEnd = '';
    await init();
    alert('비가동 처리되었습니다.');
  } catch (e) {
    console.error(e);
    alert('비가동 처리 중 오류가 발생했습니다.');
  }
};

/* ===== 상태 변경: 가동(종료) ===== */
const setUp = async () => {
  if (detail.targetStatus !== '가동') return;
  if (!detail.code) return;
  if (!confirm('가동으로 변경할까요?')) return;

  const fsId = detail._fsId;
  const endStr = now();

  if (fsId) {
    await axios.patch(`${apiBase}/facility/status/end`, {
      FS_ID: fsId,
      endTime: endStr,
      restoreStatus: 0,
      checkTime: endStr
    });
  }

  detail.downEnd = endStr;
  await init();
  alert('가동으로 전환되었습니다.');
};

function now() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/*  모달  */
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
</script>
