<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="수리 내역">
    <v-row align="center" class="mb-2">
      <v-col cols="12" md="6" class="d-flex justify-start">
        <v-text-field
          v-model.trim="productKeyword"
          placeholder="설비선택 (설비코드/설비명 입력)"
          hide-details
          density="compact"
          variant="outlined"
          style="max-width: 280px"
          clearable
        />
      </v-col>
    </v-row>

    <!-- AG Grid -->
    <ag-grid-vue
      style="height: 420px"
      :theme="quartz"
      :rowData="filteredItems"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :animateRows="true"
      :suppressClickEdit="true"
    />
  </UiParentCard>
</template>

<script setup>
import { ref, shallowRef, computed, onMounted } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

import { AgGridVue } from 'ag-grid-vue3';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
const quartz = themeQuartz;

import axios from 'axios';

const apiBase = 'http://localhost:3000';

const columnDefs = ref([
  { field: '설비코드', flex: 1 },
  { field: '설비명', flex: 1 },
  { field: '설비유형', flex: 1 },
  { field: '고장유형', flex: 1 },
  { field: '비가동시작일', flex: 1.5 },
  { field: '수리완료일', flex: 1.5 },
  { field: '수리내역', flex: 1.5 },
  { field: '담당자', flex: 1 },
  { field: '비고', flex: 2 }
]);
const defaultColDef = { editable: false, sortable: true, resizable: true };

/* 검색어 & 데이터  */
const productKeyword = ref('');
const rawItems = ref([]);

/* 날짜 포맷 */
function fmt(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return String(dt);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/* 최초 한 번 전체 로드 */
const loadRepairs = async () => {
  try {
    const { data } = await axios.get(`${apiBase}/facility/repairs`);
    const arr = Array.isArray(data) ? data : [];
    rawItems.value = arr.map((r) => ({
      설비코드: r.FAC_ID ?? '',
      설비명: r.FAC_NAME ?? '',
      설비유형: r.FAC_TYPE ?? '',
      고장유형: r.FS_TYPE_NM ?? '-',
      비가동시작일: fmt(r.DOWN_STARTDAY),
      수리완료일: fmt(r.DOWN_ENDDAY),
      수리내역: r.FR_CONTENT ?? '',
      담당자: r.MANAGER ?? '',
      비고: r.FR_NOTE ?? ''
    }));
  } catch (e) {
    console.error('loadRepairs error', e);
    rawItems.value = [];
  }
};

onMounted(loadRepairs);

/* 코드/이름 부분일치 필터링  */
const filteredItems = computed(() => {
  const kw = (productKeyword.value || '').trim().toLowerCase();
  if (!kw) return rawItems.value;

  return rawItems.value.filter((row) => {
    const code = String(row.설비코드 || '').toLowerCase();
    const name = String(row.설비명 || '').toLowerCase();
    return code.includes(kw) || name.includes(kw);
  });
});

const page = ref({ title: '설비 수리 관리' });
const breadcrumbs = shallowRef([
  { title: '설비', disabled: true, href: '#' },
  { title: '수리 내역', disabled: false, href: '#' }
]);
</script>
