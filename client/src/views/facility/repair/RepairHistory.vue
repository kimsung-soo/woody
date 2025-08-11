<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="수리 내역">
    <v-row align="center" class="mb-2">
      <v-col cols="12" md="6" class="d-flex justify-start">
        <v-text-field
          v-model.trim="productKeyword"
          placeholder="설비코드"
          hide-details
          density="compact"
          variant="outlined"
          style="max-width: 280px"
          @keyup.enter="searchProducts"
        />
        <v-btn class="ml-2" color="darkText" @click="searchProducts">검색</v-btn>
      </v-col>
    </v-row>

    <!-- AG Grid: 조회 전용 -->
    <ag-grid-vue
      style="height: 420px"
      :theme="quartz"
      :rowData="form.items"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :animateRows="true"
      :suppressClickEdit="true"
      @grid-ready="onGridReady"
    />
  </UiParentCard>
</template>

<script setup>
const columnDefs = ref([
  { headerName: '설비코드', field: 'code', minWidth: 130 },
  { headerName: '설비명', field: 'name', minWidth: 140 },
  { headerName: '설비유형', field: 'type', minWidth: 120 },
  { headerName: '고장유형', field: 'err', minWidth: 110 },
  { headerName: '비가동시작일', field: 'startdate', minWidth: 120 },
  { headerName: '수리완료일', field: 'repaircompleted', minWidth: 130 },
  { headerName: '수리내역', field: 'repairhistory', minWidth: 130 },
  { headerName: '담당자', field: 'manager', minWidth: 110 },
  { headerName: '비고', field: 'note', minWidth: 130 }
]);

import { ref, reactive, shallowRef } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

// AG Grid
import { AgGridVue } from 'ag-grid-vue3';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
const quartz = themeQuartz;

// 검색 → 퀵필터
const productKeyword = ref('');
const gridApi = ref(null);
const onGridReady = (e) => {
  gridApi.value = e.api;
};
const searchProducts = () => {
  gridApi.value?.setGridOption('quickFilterText', productKeyword.value || '');
};

const form = reactive({
  items: [
    {
      code: 'EQ-001',
      name: '띠톱 기계',
      type: '재단설비',
      err: '전기오류',
      startdate: '2025-07-01 17:00:40',
      repaircompleted: '2025-07-02 17:00:25',
      repairhistory: '부품교체',
      manager: '최은수',
      note: '-'
    },
    {
      code: 'EQ-001',
      name: '띠톱 기계',
      type: '재단설비',
      err: '모터 고장',
      startdate: '2025-07-05 09:15:20',
      repaircompleted: '2025-07-06 15:40:10',
      repairhistory: '모터 교체',
      manager: '최은수',
      note: '정기 점검 시 교체'
    },
    {
      code: 'EQ-001',
      name: '띠톱 기계',
      type: '재단설비',
      err: '소프트웨어 오류',
      startdate: '2025-07-08 14:22:55',
      repaircompleted: '2025-07-08 18:30:00',
      repairhistory: '소프트웨어 재설치',
      manager: '최은수',
      note: '-'
    },
    {
      code: 'EQ-001',
      name: '띠톱 기계',
      type: '재단설비',
      err: '베어링 마모',
      startdate: '2025-07-10 08:05:00',
      repaircompleted: '2025-07-11 10:25:15',
      repairhistory: '베어링 교체',
      manager: '최은수',
      note: '다음 점검 시 부품 예비 확보'
    },
    {
      code: 'EQ-001',
      name: '띠톱 기계',
      type: '재단설비',
      err: '전원 불량',
      startdate: '2025-07-12 16:45:35',
      repaircompleted: '2025-07-13 11:50:45',
      repairhistory: '전원 케이블 교체',
      manager: '최은수',
      note: '-'
    }
  ]
});

const defaultColDef = {
  editable: false,
  sortable: true,
  resizable: true
};

const page = ref({ title: '설비 수리 관리' });
const breadcrumbs = shallowRef([
  { title: '설비', disabled: true, href: '#' },
  { title: '수리 내역', disabled: false, href: '#' }
]);
</script>
