<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="수리 내역">
    <v-row align="center" class="mb-2">
      <v-col cols="12" md="6" class="d-flex justify-start">
        <v-text-field
          v-model.trim="productKeyword"
          placeholder="설비선택 (설비코드 입력)"
          hide-details
          density="compact"
          variant="outlined"
          style="max-width: 280px"
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
import { ref, reactive, shallowRef, computed } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

import { AgGridVue } from 'ag-grid-vue3';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
const quartz = themeQuartz;

/* ====== 컬럼 정의 (필터 UI 전혀 사용 안 함) ====== */
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

/* ====== 검색어 & 데이터 ====== */
const productKeyword = ref('');

/* 원본 데이터 (그리드 필터 대신 여기서 필터링) */
const form = reactive({
  items: [
    {
      설비코드: 'EQ-001',
      설비명: '띠톱 기계',
      설비유형: '재단설비',
      고장유형: '전기오류',
      비가동시작일: '2025-07-01 17:00:40',
      수리완료일: '2025-07-02 17:00:25',
      수리내역: '부품교체',
      담당자: '최은수',
      비고: '-'
    },
    {
      설비코드: 'EQ-001',
      설비명: '띠톱 기계',
      설비유형: '재단설비',
      고장유형: '모터 고장',
      비가동시작일: '2025-07-05 09:15:20',
      수리완료일: '2025-07-06 15:40:10',
      수리내역: '모터 교체',
      담당자: '최은수',
      비고: '정기 점검 시 교체'
    },
    {
      설비코드: 'EQ-001',
      설비명: '띠톱 기계',
      설비유형: '재단설비',
      고장유형: '소프트웨어 오류',
      비가동시작일: '2025-07-08 14:22:55',
      수리완료일: '2025-07-08 18:30:00',
      수리내역: '소프트웨어 재설치',
      담당자: '최은수',
      비고: '-'
    },
    {
      설비코드: 'EQ-002',
      설비명: '직각 왕복 판톱',
      설비유형: '재단설비',
      고장유형: '베어링 마모',
      비가동시작일: '2025-07-10 08:05:00',
      수리완료일: '2025-07-11 10:25:15',
      수리내역: '베어링 교체',
      담당자: '최은수',
      비고: '다음 점검 시 부품 예비 확보'
    },
    {
      설비코드: 'EQ-003',
      설비명: 'CNC조각기',
      설비유형: '재단설비',
      고장유형: '전원 불량',
      비가동시작일: '2025-07-12 16:45:35',
      수리완료일: '2025-07-13 11:50:45',
      수리내역: '전원 케이블 교체',
      담당자: '최은수',
      비고: '-'
    }
  ]
});

/* 입력값 기준으로 실시간 필터링 (대소문자 무시, 부분 일치) */
const filteredItems = computed(() => {
  const q = (productKeyword.value || '').trim().toUpperCase();
  if (!q) return form.items;
  return form.items.filter((item) => (item.설비코드 || '').toUpperCase().includes(q));
});

const page = ref({ title: '설비 수리 관리' });
const breadcrumbs = shallowRef([
  { title: '설비', disabled: true, href: '#' },
  { title: '수리 내역', disabled: false, href: '#' }
]);
</script>
