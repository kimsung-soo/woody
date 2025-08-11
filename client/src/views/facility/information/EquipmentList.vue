<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="설비 정보조회">
    <v-row align="center" class="mb-2">
      <v-col cols="12" md="6" class="d-flex justify-start">
        <v-text-field
          v-model.trim="productKeyword"
          placeholder="공정코드"
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
  {
    headerName: '사용유무',
    field: 'useYn',
    minWidth: 120,
    cellStyle: (params) => {
      if (params.value == '사용') {
        return { color: 'blue' };
      } else if (params.value == '정지') {
        return { color: 'red' };
      }
      return null;
    }
  },
  { headerName: '제조사', field: 'maker', minWidth: 120 },
  { headerName: '설비제조일', field: 'makeDate', minWidth: 130 },
  { headerName: '설비설치일', field: 'installDate', minWidth: 130 },
  { headerName: '점검주기(일)', field: 'checkCycle', minWidth: 130 },
  { headerName: '고장유형', field: 'err', minWidth: 110 },
  { headerName: '담당자', field: 'manager', minWidth: 110 }
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
      name: '드릴 프레스',
      type: '가공',
      useYn: '사용',
      maker: 'A사',
      makeDate: '2025-01-15',
      installDate: '2025-02-18',
      checkCycle: 180,
      err: '-',
      manager: '이동섭'
    },
    {
      code: 'EQ-002',
      name: '직각 왕복 판톱',
      type: '재단설비',
      useYn: '사용',
      maker: 'A사',
      makeDate: '2025-01-15',
      installDate: '2025-02-18',
      checkCycle: 180,
      err: '-',
      manager: '정경준'
    }
  ]
});

const defaultColDef = {
  editable: false,
  sortable: true,
  resizable: true
};

const page = ref({ title: '설비 정보 관리' });
const breadcrumbs = shallowRef([
  { title: '설비', disabled: true, href: '#' },
  { title: '전체 조회', disabled: false, href: '#' }
]);
</script>
