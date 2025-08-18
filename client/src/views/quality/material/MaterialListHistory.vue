<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <UiParentCard>
    <v-row class="mb-4">
      <v-col cols="3">
        <v-text-field label="원자재명" v-model="form.materialName" dense outlined />
      </v-col>
      <v-col cols="3">
        <!-- 처리상태를 드롭다운으로 변경 -->
        <v-select label="처리상태" v-model="form.status" :items="statusOptions" item-title="label" item-value="value" dense outlined />
      </v-col>
      <v-col cols="3">
        <v-text-field label="검사완료일자" v-model="form.inspector" type="date" dense outlined />
      </v-col>
      <!-- <v-col cols="3">
        <v-text-field label="입고일자" v-model="form.orderDate" type="date" dense outlined />
      </v-col> -->
      <!-- 버튼 -->
      <v-row justify="end">
        <v-btn color="primary" variant="elevated" @click="searchData" class="mr-2">조회</v-btn>
        <v-btn color="error" variant="elevated" @click="resetForm">초기화</v-btn>
      </v-row>
    </v-row>
    <br />

    <!-- 로딩 상태 표시 -->
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

    <ag-grid-vue :rowData="gridData" :columnDefs="colDefs" :theme="quartz" :gridOptions="gridOptions" style="height: 400px" />
  </UiParentCard>
</template>

<script setup lang="ts">
import axios from 'axios';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { ref, shallowRef, reactive, computed, type Ref, onMounted } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { AllCommunityModule, ModuleRegistry, themeQuartz, type ColDef, PaginationModule, type GridOptions } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule, PaginationModule]);
const quartz = themeQuartz;

// ----- 기존 breadcrumb -----
const page = ref({ title: '원자재검수이력조회' });
const breadcrumbs = shallowRef([
  { title: '품질', disabled: true, href: '#' },
  { title: '원자재검수이력조회', disabled: false, href: '#' }
]);

// ----- 폼 상태(필터) -----
interface FormType {
  materialName: string; // 원자재명 검색어
  status: string; // 처리상태 검색어
  inspector: string; // 검사완료일자
}
const form = reactive<FormType>({
  materialName: '',
  status: '',
  inspector: ''
});

// ----- ag-Grid용 행 타입/데이터/컬럼 -----
interface Row {
  inspectionNo: string; // 검사번호
  receiptNo: string; // 입고번호
  materialCode: string; // 원자재코드
  materialName: string; // 원자재이름
  qty: number; // 총수량
  status: string; // 합불 여부
  createdBy: string; // 검사완료일자
}

// DB에서 불러온 원본 데이터
const rowData: Ref<Row[]> = ref([]);
const loading = ref(false);

// 공통코드의 상태 코드 라벨 매핑
const STATUS_MAP = {
  '01': '합격',
  '02': '불합격'
} as const;

const colDefs: Ref<ColDef<Row>[]> = ref([
  { headerName: '검사번호', field: 'inspectionNo', flex: 1, resizable: true },
  { headerName: '입고번호', field: 'receiptNo', flex: 1, resizable: true },
  { headerName: '원자재코드', field: 'materialCode', flex: 1, resizable: true },
  { headerName: '원자재명', field: 'materialName', flex: 1, resizable: true },
  { headerName: '총수량', field: 'qty', flex: 1, resizable: true },
  {
    headerName: '처리상태',
    field: 'status',
    flex: 1,
    resizable: true,
    cellRenderer: (params: any) => STATUS_MAP[params.value as keyof typeof STATUS_MAP] || params.value
  },
  {
    headerName: '검사완료일자',
    field: 'createdBy',
    flex: 1,
    resizable: true,
    cellRenderer: (params: any) => {
      if (!params.value) return '-';
      // ISO 날짜 형식을 YYYY-MM-DD로 변환
      const date = new Date(params.value);
      return date.toISOString().split('T')[0];
    }
  }
]);

// ----- DB에서 원자재검수이력 데이터 불러오기 -----
const getMatHisAll = async () => {
  try {
    loading.value = true;
    const result = await axios.get('http://localhost:3000/mathisall');

    console.log('result data는 => ' + result);

    if (result.data && Array.isArray(result.data)) {
      // DB 데이터를 Row 인터페이스에 맞게 매핑
      rowData.value = result.data.map((item: any) => ({
        inspectionNo: item.MAT_CERT_ID || item.MAT_CERT_ID || '',
        receiptNo: item.RECEIPT_NO || item.RECEIPT_NO || '',
        materialCode: item.MAT_CODE || item.MAT_CODE || '',
        materialName: item.MAT_NAME || item.MAT_NAME || '',
        qty: Number(item.TOTAL_QTY) || 0,
        status: item.MAT_STATUS || '',
        createdBy: item.Q_CHECKED_DATE || ''
      }));
    } else {
      rowData.value = [];
    }
  } catch (err) {
    console.error('데이터 조회 중 오류 발생:', err);
    rowData.value = [];
    // 에러 처리 - 사용자에게 알림 표시 등
  } finally {
    loading.value = false;
  }
};

// ----- 상단 필터를 적용한 그리드 데이터 ----
const gridData = computed(() => {
  const name = form.materialName.trim().toLowerCase();
  const selectedStatusCode = form.status;
  const inspectorDate = form.inspector;

  return rowData.value.filter((r) => {
    // 원자재명 필터링
    const byName = !name || r.materialName.toLowerCase().includes(name);

    // 처리상태 필터링
    const byStatus = !selectedStatusCode || r.status === selectedStatusCode;

    // 검사완료일자 필터링 (날짜 형식이 YYYY-MM-DD라고 가정)
    const byInspectorDate = !inspectorDate || r.createdBy >= inspectorDate;

    return byName && byStatus && byInspectorDate;
  });
});

// 페이지네이션, 컬럼 사이즈조절
const gridOptions = ref<GridOptions<Row>>({
  defaultColDef: { flex: 1, minWidth: 100, resizable: true },
  pagination: true,
  paginationAutoPageSize: true,
  paginationPageSizeSelector: true
});

// ----- 버튼 핸들러 -----
function resetForm(): void {
  form.materialName = '';
  form.status = '';
  form.inspector = '';
}

// 조회 버튼 클릭 시 데이터 다시 불러오기
function searchData(): void {
  getMatHisAll();
}

// 공통코드 처리상태
interface StatusOption {
  label: string;
  value: string;
}
const statusOptions = ref<StatusOption[]>([]);

// 처리상태 옵션 불러오기
const getStatusOptions = async () => {
  try {
    const result = await axios.get('http://localhost:3000/qccommon');
    if (result.data && Array.isArray(result.data) && result.data.length > 0) {
      statusOptions.value = result.data.map((item: any) => ({
        label: item.code_name || item.codeName || '',
        value: item.code_name || item.codeName || '' // SQL에서 '합격'/'불합격'로 변환되므로 라벨값으로 비교
      }));
    }
  } catch (err) {
    console.error('공통코드 조회 중 오류 발생:', err);
  }
};

// ----- 컴포넌트 마운트 시 데이터 로드 -----
onMounted(async () => {
  await Promise.all([
    getStatusOptions(), // 처리상태 옵션 로드
    getMatHisAll() // 원자재검수이력 데이터 로드
  ]);
});
</script>

<style scoped>
.mr2 {
  margin-right: 100px;
}
.mr-2 {
  margin-right: 8px;
}
</style>
