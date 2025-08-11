<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="점검 내역">
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
import { ref, reactive, shallowRef } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

// AG Grid
import { AgGridVue } from 'ag-grid-vue3';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
const quartz = themeQuartz;

// 컬럼 정의
const columnDefs = ref([
  { headerName: '설비코드', field: 'code', minWidth: 130 },
  { headerName: '설비명', field: 'name', minWidth: 140 },
  { headerName: '점검내역', field: 'checkhistory', minWidth: 120 },
  { headerName: '점검시작일', field: 'checkstart', minWidth: 110 },
  { headerName: '점검완료일', field: 'checkdone', minWidth: 120 },
  { headerName: '다음점검일', field: 'nextcheck', minWidth: 130 },
  {
    headerName: '적합여부',
    field: 'fitness',
    minWidth: 130,
    cellStyle: (params) => {
      if (params.value == '적합') {
        return { color: 'blue' };
      } else if (params.value == '부적합') {
        return { color: 'red' };
      }
      return null;
    }
  },
  { headerName: '부적합여부', field: 'unsuitable', minWidth: 110 },
  { headerName: '담당자', field: 'manager', minWidth: 130 }
]);

// 검색 관련
const productKeyword = ref('');
const gridApi = ref(null);
const onGridReady = (e) => {
  gridApi.value = e.api;
};
const searchProducts = () => {
  gridApi.value?.setGridOption('quickFilterText', productKeyword.value || '');
};

// 더미 데이터 (5개)
const form = reactive({
  items: [
    {
      code: 'EQ-001',
      name: '띠톱 기계',
      checkhistory: '정기 점검 - 전기 계통',
      checkstart: '2025-07-01 09:00',
      checkdone: '2025-07-01 11:30',
      nextcheck: '2025-08-01',
      fitness: '적합',
      unsuitable: '-',
      manager: '최은수'
    },
    {
      code: 'EQ-002',
      name: '프레스 기계',
      checkhistory: '정기 점검 - 유압 시스템',
      checkstart: '2025-07-03 14:00',
      checkdone: '2025-07-03 15:20',
      nextcheck: '2025-08-03',
      fitness: '적합',
      unsuitable: '-',
      manager: '박민수'
    },
    {
      code: 'EQ-003',
      name: 'CNC 선반',
      checkhistory: '베어링 마모 확인',
      checkstart: '2025-07-05 10:00',
      checkdone: '2025-07-05 12:00',
      nextcheck: '2025-08-05',
      fitness: '부적합',
      unsuitable: '부품 교체 필요',
      manager: '김하나'
    },
    {
      code: 'EQ-004',
      name: '용접 로봇',
      checkhistory: '센서 오작동 점검',
      checkstart: '2025-07-08 09:30',
      checkdone: '2025-07-08 10:15',
      nextcheck: '2025-08-08',
      fitness: '적합',
      unsuitable: '-',
      manager: '이성준'
    },
    {
      code: 'EQ-005',
      name: '절단기',
      checkhistory: '소프트웨어 업데이트',
      checkstart: '2025-07-10 13:00',
      checkdone: '2025-07-10 13:45',
      nextcheck: '2025-08-10',
      fitness: '적합',
      unsuitable: '-',
      manager: '정유진'
    }
  ]
});

// 공통 컬럼 속성
const defaultColDef = {
  editable: false,
  sortable: true,
  resizable: true
};

// 페이지 제목 & breadcrumb
const page = ref({ title: '설비 점검 관리' });
const breadcrumbs = shallowRef([
  { title: '설비', disabled: true, href: '#' },
  { title: '점검 내역', disabled: false, href: '#' }
]);
</script>
