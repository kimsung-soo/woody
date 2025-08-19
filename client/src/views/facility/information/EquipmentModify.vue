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

    <ag-grid-vue
      style="height: 460px"
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

    <!-- 상세 수정 폼 -->
    <v-card v-if="form.code" class="mt-6 pa-4">
      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field label="설비코드" v-model="form.code" dense outlined />
          <v-text-field label="설비명" v-model="form.name" dense outlined />
          <v-text-field label="설비유형" v-model="form.type" dense outlined />
          <v-text-field label="제조사" v-model="form.manufacturer" dense outlined />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field label="설비등록일" v-model="form.registeredAt" dense outlined />
          <v-text-field label="설비설치일" v-model="form.installedAt" dense outlined />
          <v-text-field label="담당자" v-model="form.manager" dense outlined />
          <v-text-field label="비고" v-model="form.remark" dense outlined />
        </v-col>

        <v-col cols="12" md="6">
          <v-label class="mb-2 d-block">사용유무</v-label>
          <v-radio-group v-model="form.useYn" inline>
            <v-radio label="사용" value="사용" />
            <v-radio label="정지" value="정지" />
          </v-radio-group>
        </v-col>
      </v-row>

      <div class="text-right mt-2">
        <v-btn color="success" @click="saveEdit">수정</v-btn>
      </div>
    </v-card>
  </UiParentCard>
</template>

<script setup>
import { ref, reactive, shallowRef, onMounted } from 'vue';
import axios from 'axios';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { AgGridVue } from 'ag-grid-vue3';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
const quartz = themeQuartz;

/* ====== API 엔드포인트 ====== */
/* 서버(app.js)가 라우터를 루트에 마운트하므로 /api 없음 */
const API_BASE = 'http://localhost:3000';
const LIST_URL = `${API_BASE}/facility`;
const UPDATE_URL = `${API_BASE}/facilityUpdate`;
console.log('[CALL] LIST_URL =', LIST_URL);
console.log('[CALL] UPDATE_URL =', UPDATE_URL);

/* 페이지 헤더 */
const page = ref({ title: '설비 정보 관리' });
const breadcrumbs = shallowRef([
  { title: '설비', disabled: true, href: '#' },
  { title: '정보 수정', disabled: false, href: '#' }
]);

/* 공정코드 필터 */
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

const rows = ref([]);

/* 컬럼: 화면에는 안 보여도 데이터에는 PR_ID/FAC_CHECKDAY를 싣는다 */
const columnDefs = ref([
  { field: '공정코드', hide: true, filter: 'agTextColumnFilter' },
  { field: '설비코드', flex: 1 },
  { field: '설비명', flex: 1 },
  { field: '설비유형', flex: 1 },
  {
    field: '사용유무',
    flex: 1,
    cellStyle: (p) => {
      if (p.value === '사용') return { color: 'blue', fontWeight: 'bold' };
      if (p.value === '정지') return { color: 'red', fontWeight: 'bold' };
      return null;
    }
  },
  { field: '제조사', flex: 1 },
  { field: '설비등록일', flex: 1 },
  { field: '설비설치일', flex: 1 },
  { field: '담당자', flex: 1 }
]);
const defaultColDef = { editable: false, sortable: true, resizable: true };

/* 데이터 매핑 */
const fmtDate = (v) => (typeof v === 'string' ? v.slice(0, 10) : (v ?? ''));
const mapRow = (r) => ({
  공정코드: r.PR_ID ?? '',
  설비코드: r.FAC_ID ?? '',
  설비명: r.FAC_NAME ?? '',

  // 원본 키 유지
  FAC_TYPE: r.FAC_TYPE ?? '', // 저장용(코드)
  FAC_TYPE_NM: r.FAC_TYPE_NM ?? undefined, // 표시용(이름, 조인 시 존재)

  // 표시용 필드
  설비유형: r.FAC_TYPE_NM ?? r.FAC_TYPE ?? '',

  사용유무: (r.FAC_USE ?? 1) === 1 ? '사용' : '정지',
  제조사: r.FAC_COMPANY ?? '',
  설비등록일: fmtDate(r.FAC_MDATE),
  설비설치일: fmtDate(r.FAC_IDATE),
  담당자: r.MANAGER ?? '',

  // 숨겨둔 원본
  PR_ID: r.PR_ID ?? '',
  FAC_CHECKDAY: r.FAC_CHECKDAY ?? null
});

/* 목록 조회 */
const fetchList = async () => {
  try {
    const res = await axios.get(LIST_URL);
    const list = Array.isArray(res?.data) ? res.data : [];
    rows.value = list.map(mapRow);
    if (processCode.value) applyProcessFilter(processCode.value);
  } catch (e) {
    console.error('[facility list] error:', e);
    alert(e?.response?.data?.error || e?.message || '설비 목록 조회 실패');
  }
};
onMounted(fetchList);

/* 폼 상태 (단일 소스만 사용: 별칭 제거) */
const form = reactive({
  code: '',
  name: '',
  type: '',
  useYn: '',
  manufacturer: '',
  registeredAt: '',
  installedAt: '',
  manager: '',
  remark: '',
  // 서버 UPDATE에 필요한 것들
  prId: '',
  checkDay: null
});

/* 행 선택 → 폼 채우기 */
const onPick = (e) => {
  const d = e.data;
  form.code = d.설비코드;
  form.name = d.설비명;
  form.type = d.설비유형;
  form.useYn = d.사용유무 || '';
  form.manufacturer = d.제조사 || '';
  form.registeredAt = d.설비등록일 || '';
  form.installedAt = d.설비설치일 || '';
  form.manager = d.담당자 || '';
  form.remark = '';

  // 숨겨둔 원본 키/필드
  form.prId = d.PR_ID || d.공정코드 || '';
  form.checkDay = d.FAC_CHECKDAY ?? null;

  // 상단 공정 필터 표시도 동기화(선택 사항)
  processCode.value = form.prId || '';
};

/* 수정 저장 */
const saveEdit = async () => {
  if (!form.code) return alert('수정할 설비를 선택하세요.');

  // 날짜는 YYYY-MM-DD로 제한
  const registered = form.registeredAt ? String(form.registeredAt).slice(0, 10) : null;
  const installed = form.installedAt ? String(form.installedAt).slice(0, 10) : null;

  const payload = {
    FAC_ID: form.code,
    FAC_NAME: form.name || null,
    FAC_TYPE: form.type || null,
    FAC_USE: form.useYn === '사용' ? 1 : 0,
    FAC_COMPANY: form.manufacturer || null,
    FAC_MDATE: registered,
    FAC_IDATE: installed,
    FAC_CHECKDAY: form.checkDay ?? null, // 기존값 유지
    PR_ID: form.prId || null, // WHERE에는 쓰지 않지만 FK 유지용
    MANAGER: form.manager || null,
    MEMO: form.remark || null
  };
  console.log('[UPDATE payload]', payload);

  try {
    const res = await axios.put(UPDATE_URL, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    // 응답 해석: affectedRows vs changedRows 분리
    const raw = res?.data;
    const affected = Number((typeof raw === 'number' ? raw : (raw?.affectedRows ?? raw?.[0]?.affectedRows)) ?? 0);
    const changed = Number((typeof raw === 'number' ? raw : (raw?.changedRows ?? raw?.[0]?.changedRows)) ?? 0);

    if (res.status === 200) {
      if (affected === 0) {
        alert('수정 되었습니다 ');
      } else if (changed === 0) {
        alert('수정 변경사항이 없습니다');
      }

      await fetchList();
      gridApi.value?.refreshCells({ force: true });
    } else {
      alert(`수정 실패 `);
    }
  } catch (e) {
    console.error('[facility update] error:', e);
    alert(e?.response?.data?.error || e.message || '수정 저장 실패');
  }
};

/* 공정 조회 모달 */
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
