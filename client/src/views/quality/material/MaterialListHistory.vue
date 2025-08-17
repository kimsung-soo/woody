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
      <v-col cols="3">
        <v-text-field label="입고일자" v-model="form.orderDate" type="date" dense outlined />
      </v-col>
      <!-- 버튼 -->
      <v-row justify="end">
        <v-btn color="error" variant="elevated" @click="resetForm">초기화</v-btn>
      </v-row>
    </v-row>
    <br />
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
  orderDate: string; // 입고일자
}
const form = reactive<FormType>({
  materialName: '',
  status: '',
  inspector: '',
  orderDate: ''
});

// ----- ag-Grid용 행 타입/데이터/컬럼 -----
interface Row {
  // 재정의
  inspectionNo: string; // 검사번호
  receiptNo: string; // 입고번호
  materialCode: string; // 원자재코드
  materialName: string; // 원자재이름
  qty: number; // 총수량
  orderDate: string; // 입고일자
  status: string; // 합불 여부
  createdBy: string; // 검사완료일자
}
const rowData: Ref<Row[]> = ref([
  {
    inspectionNo: 'QC001',
    receiptNo: '1000',
    materialCode: 'MT1001',
    materialName: '원목',
    qty: 50,
    orderDate: '2025-07-28',
    status: '01',
    createdBy: '2025-07-30'
  },
  {
    inspectionNo: 'QC002',
    receiptNo: '1001',
    materialCode: 'MT1002',
    materialName: '합판',
    qty: 100,
    orderDate: '2025-07-28',
    status: '02',
    createdBy: '2025-07-30'
  },
  {
    inspectionNo: 'QC003',
    receiptNo: '1002',
    materialCode: 'MT1001',
    materialName: '원목',
    qty: 100,
    orderDate: '2025-07-30',
    status: '01',
    createdBy: '2025-08-01'
  },
  {
    inspectionNo: 'QC004',
    receiptNo: '1003',
    materialCode: 'MT1002',
    materialName: '합판',
    qty: 150,
    orderDate: '2025-08-01',
    status: '02',
    createdBy: '2025-08-03'
  },
  {
    inspectionNo: 'QC005',
    receiptNo: '1004',
    materialCode: 'MT1002',
    materialName: '합판',
    qty: 200,
    orderDate: '2025-08-03',
    status: '01',
    createdBy: '2025-08-05'
  }
]);

const colDefs: Ref<ColDef<Row>[]> = ref([
  { headerName: '검사번호', field: 'inspectionNo', flex: 1, resizable: true },
  { headerName: '입고번호', field: 'receiptNo', flex: 1, resizable: true },
  { headerName: '원자재코드', field: 'materialCode', flex: 1, resizable: true },
  { headerName: '원자재명', field: 'materialName', flex: 1, resizable: true },
  { headerName: '총수량', field: 'qty', flex: 1, resizable: true },
  { headerName: '입고일자', field: 'orderDate', flex: 1, resizable: true },
  { headerName: '최종상태', field: 'status', flex: 1, resizable: true },
  {
    headerName: '최종상태',
    field: 'status',
    flex: 1,
    resizable: true,
    cellRenderer: (params: any) => STATUS_MAP[params.value as keyof typeof STATUS_MAP] || params.value
  }
]);

// 공통코드의 상태 코드 라벨 매핑
const STATUS_MAP = {
  '01': '합격',
  '02': '불합격'
} as const;
// ----- 상단 필터를 적용한 그리드 데이터 ----
const gridData = computed(() => {
  const name = form.materialName.trim().toLowerCase();
  const nameIns = form.inspector.trim().toLowerCase();
  const selectedStatusCode = form.status; // 드롭다운에서 선택한 코드 ('01' or '02')
  const from = form.orderDate || '';

  return rowData.value.filter((r) => {
    const byName = !name || r.materialName.toLowerCase().includes(name);
    const creBy = !nameIns || r.createdBy.toLowerCase().includes(nameIns);

    // 상태 필터링: 선택된 코드에 해당하는 라벨과 데이터의 status 비교
    const byStatus = !selectedStatusCode || r.status === STATUS_MAP[selectedStatusCode as keyof typeof STATUS_MAP];

    const byFrom = !from || r.orderDate >= from;
    return byName && creBy && byStatus && byFrom;
  });
});

// 페이지네이션, 컬럼 사이즈조절
const gridOptions = ref<GridOptions<Row>>({
  defaultColDef: { flex: 1, minWidth: 100, resizable: true },
  // columnDefs: colDefs,
  pagination: true,
  paginationAutoPageSize: true, // 화면 높이에 맞춰 자동 조절
  paginationPageSizeSelector: true
});

// ----- 버튼 핸들러 -----
function resetForm(): void {
  form.materialName = '';
  form.status = '';
  form.inspector = '';
  form.orderDate = '';
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
    if (result.data.length > 0) {
      statusOptions.value = result.data.map((item: any) => ({
        label: item.code_name,
        value: item.code
      }));
    }
  } catch (err) {
    console.error(err);
  }
};

// ----- 컴포넌트 마운트 시 데이터 로드 -----
onMounted(() => {
  getStatusOptions(); // 처리상태 옵션 로드
});
</script>

<style scoped>
.mr2 {
  margin-right: 100px;
}
</style>
