<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>

  <UiParentCard title="설비 상태조회">
    <v-row align="center" class="mb-2">
      <v-col cols="12" md="6" class="d-flex justify-start">
        <v-text-field
          v-model.trim="productKeyword"
          placeholder="공정선택"
          hide-details
          density="compact"
          variant="outlined"
          style="max-width: 280px"
          @keyup.enter="searchProducts"
        />
        <v-btn class="ml-2" color="darkText" @click="searchProducts">검색</v-btn>
      </v-col>
    </v-row>

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
  {
    headerName: '설비상태',
    field: 'status',
    minWidth: 120,
    cellStyle: (params) => {
      if (params.value == '가동') {
        return { color: 'blue' };
      } else if (params.value == '비가동') {
        return { color: 'red' };
      }
      return null;
    }
  },
  { headerName: '비가동 사유', field: 'not', minWidth: 120 },
  { headerName: '점검완료일', field: 'done', minWidth: 130 },
  { headerName: '다음점검일', field: 'next', minWidth: 130 },
  { headerName: '담당자', field: 'manager', minWidth: 120 }
]);

import { ref, reactive, shallowRef } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

// AG Grid
import { AgGridVue } from 'ag-grid-vue3';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
const quartz = themeQuartz;

const productKeyword = ref('');
const gridApi = ref(null);
const onGridReady = (e) => {
  gridApi.value = e.api;
};

const searchProducts = () => {
  gridApi.value?.setGridOption('quickFilterText', productKeyword.value || '');
};

const defaultColDef = {
  editable: false,
  sortable: true,
  resizable: true
};

const page = ref({ title: '설비 상태관리' });
const breadcrumbs = shallowRef([
  {
    title: '설비 상태',
    disabled: true,
    href: '#'
  },
  {
    title: '전체 조회',
    disabled: false,
    href: '#'
  }
]);

const form = reactive({
  items: [
    {
      code: 'EQ-001',
      name: '띠톱기계',
      type: '재단공정',
      status: '비가동',
      not: '전기 이상',
      done: '2025-01-15 17:00:53',
      next: '2025-07-18',
      manager: '이동섭'
    },

    {
      code: 'EQ-001',
      name: '직각 왕복 판톱',
      type: '재단공정',
      status: '가동',
      not: '-',
      done: '2025-01-15 19:00:00',
      next: '2025-07-18',
      manager: '이동섭'
    }
  ]
});
</script>
