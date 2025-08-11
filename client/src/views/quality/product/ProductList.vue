<template>
  <div style="height: 500px">
    <ag-grid-vue
      style="width: 100%; height: 100%"
      class="ag-theme-alpine"
      :columnDefs="columnDefs"
      :rowData="rowData"
      @grid-ready="onGridReady"
    >
      <ag-grid-vue :rowData="rowData" :columnDefs="colDefs" :theme="quartz" style="height: 200px" />
    </ag-grid-vue>
  </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue3';
import { ref, shallowRef, type Ref, type ShallowRef } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { AllCommunityModule, ModuleRegistry, themeQuartz, type ColDef } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);
const quartz = themeQuartz;
export default {
  components: {
    'ag-grid-vue': AgGridVue
  },
  data() {
    return {
      columnDefs: [],
      rowData: []
    };
  },
  mounted() {
    this.columnDefs = [{ field: 'make' }, { field: 'model' }, { field: 'price' }];

    this.rowData = [
      { make: 'Toyota', model: 'Celica', price: 35000 },
      { make: 'Ford', model: 'Mondeo', price: 32000 },
      { make: 'Porsche', model: 'Boxster', price: 72000 }
    ];
  },
  methods: {
    onGridReady(params) {
      // 그리드 초기화 후 필요한 작업 (예: 데이터 로드)
      this.gridApi = params.api;
      this.gridColumnApi = params.columnApi;
    }
  }
};
</script>
