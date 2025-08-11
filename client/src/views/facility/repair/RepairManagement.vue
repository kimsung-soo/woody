<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="설비 수리관리 페이지">
    <!-- 검색 조건 -->
    <v-row align="center" class="mb-4">
      <v-col cols="12" md="6" class="d-flex justify-start">
        <v-text-field
          v-model.trim="processCode"
          placeholder="공정선택"
          hide-details
          density="compact"
          variant="outlined"
          style="max-width: 200px"
        />
        <v-btn class="ml-2" color="darkText">검색</v-btn>
      </v-col>
    </v-row>

    <!-- 목록 -->
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
          <v-text-field label="담당자" v-model="form.manager" dense outlined readonly />
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
import { ref, reactive, shallowRef } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { AgGridVue } from 'ag-grid-vue3';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
const quartz = themeQuartz;

const page = ref({ title: '설비 수리관리' });
const breadcrumbs = shallowRef([
  { title: '설비', disabled: true, href: '#' },
  { title: '수리관리', disabled: false, href: '#' }
]);

const processCode = ref('');
const gridApi = ref(null);
const onGridReady = (e) => (gridApi.value = e.api);

const columnDefs = ref([
  { headerName: '설비코드', field: 'code', minWidth: 120 },
  { headerName: '설비명', field: 'name', minWidth: 150 },
  { headerName: '설비유형', field: 'type', minWidth: 130 },
  { headerName: '비가동 사유', field: 'downReason', minWidth: 180 },
  { headerName: '고장유형', field: 'err', minWidth: 180 },
  { headerName: '비가동 시작시간', field: 'downStart', minWidth: 180 },
  { headerName: '담당자', field: 'manager', minWidth: 325 }
]);
const defaultColDef = { editable: false, sortable: true, resizable: true };

// 목록 (더미)
const rows = ref([
  {
    code: 'EQ003',
    name: 'CNC조각기',
    type: '재단설비',
    downReason: '점검',
    err: '전기이상',
    downStart: '2025-07-30 17:00:40',
    manager: '이동섭'
  },
  {
    code: 'EQ003',
    name: 'CNC조각기',
    type: '재단설비',
    downReason: '점검',
    err: '센서 오류',
    downStart: '2025-07-28 17:00:40',
    manager: '이동섭'
  },
  {
    code: 'EQ003',
    name: 'CNC조각기',
    type: '재단설비',
    downReason: '점검',
    err: 'SW오류',
    downStart: '2025-07-15 15:42:40',
    manager: '이동섭'
  }
]);

const form = reactive({
  code: '',
  name: '',
  type: '',
  err: '',
  manager: '',
  repairStart: '',
  repairEnd: '',
  note: '',
  remark: ''
});

const onPick = (e) => {
  const d = e.data;
  form.code = d.code;
  form.name = d.name;
  form.type = d.type;
  form.err = d.err;
  form.manager = d.manager || '';
  form.repairStart = d.downStart || now();
  form.repairEnd = '';
  form.note = '';
  form.remark = '';
};

const completeRepair = () => {
  if (!form.code) return;
  form.repairEnd = now();
  const row = rows.value.find((r) => r.code === form.code);
  if (row) {
    row.downReason = '-';
    row.err = '-';
  }
  gridApi.value?.refreshCells({ force: true });
  alert('수리 완료 되었습니다.');
};

function now() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
</script>

<style scoped>
:deep(.v-field__input) {
  min-height: 36px;
}
</style>
