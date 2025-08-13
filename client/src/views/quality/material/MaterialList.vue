<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <UiParentCard>
    <v-row class="mb-4">
      <v-col cols="3">
        <v-text-field label="원자재명" v-model="form.supplier" dense outlined />
      </v-col>
      <v-col cols="3">
        <v-text-field label="처리상태" v-model="form.contact" dense outlined />
      </v-col>
      <v-col cols="3">
        <v-text-field label="발주일자" v-model="form.orderDate" type="date" dense outlined />
      </v-col>
      <v-col cols="3">
        <v-text-field label="납기일자" v-model="form.dueDate" type="date" dense outlined />
      </v-col>
      <!-- 버튼 -->
      <v-row justify="end">
        <v-btn color="primary" class="mr-2" @click="resetForm" style="z-index: 2">조회</v-btn>
      </v-row>
    </v-row>
    <br />
    <ag-grid-vue
      :rowData="gridData"
      :columnDefs="colDefs"
      :theme="quartz"
      :gridOptions="gridOptions"
      @row-clicked="onRowClicked"
      style="height: 400px"
    />
  </UiParentCard>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { ref, shallowRef, reactive, computed, type Ref } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { AllCommunityModule, ModuleRegistry, themeQuartz, type ColDef, PaginationModule, type GridOptions } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule, PaginationModule]);
const quartz = themeQuartz;
const router = useRouter();

// ----- 기존 breadcrumb -----
const page = ref({ title: '원자재검수조회' });
const breadcrumbs = shallowRef([
  { title: '품질', disabled: true, href: '#' },
  { title: '원자재검수조회', disabled: false, href: '#' }
]);

// ----- 폼 상태(필터) -----
interface Item {
  name: string;
  code: string;
  qty: number;
  price: number;
  note: string;
  amount: number;
}
interface FormType {
  supplier: string; // 원자재명 검색어
  contact: string; // 처리상태 검색어
  issueNumber: string;
  orderDate: string; // 발주일자(From)
  dueDate: string; // 납기일자(To)
  items: Item[];
}
const form = reactive<FormType>({
  supplier: '',
  contact: '',
  issueNumber: '',
  orderDate: '',
  dueDate: '',
  items: [
    { name: '', code: '', qty: 0, price: 0, note: '', amount: 0 },
    { name: '', code: '', qty: 0, price: 0, note: '', amount: 0 },
    { name: '', code: '', qty: 0, price: 0, note: '', amount: 0 }
  ]
});

// ----- ag-Grid용 행 타입/데이터/컬럼 -----
interface Row {
  inspectionNo: string; // 검사번호
  receiptNo: string; // 입고번호
  materialCode: string; // 자재코드
  materialName: string; // 자재명
  qty: number; // 수량
  unitPrice: number; // 단가
  amount: number; // 금액
  orderDate: string; // 발주일자 YYYY-MM-DD
  dueDate: string; // 납기일자 YYYY-MM-DD
  status: string; // 처리상태 (합격/불합격 등)
  inspector: string; // 검수확인인
}
const rowData: Ref<Row[]> = ref([
  {
    inspectionNo: 'MITEST-A01',
    receiptNo: 'RCPT-0001',
    materialCode: 'MT1001',
    materialName: '합판',
    qty: 100,
    unitPrice: 500,
    amount: 50000,
    orderDate: '2025-07-28',
    dueDate: '2025-07-30',
    status: '합격',
    inspector: '한지수'
  },
  {
    inspectionNo: 'MITEST-A02',
    receiptNo: 'RCPT-0002',
    materialCode: 'WD00003',
    materialName: '원목',
    qty: 50,
    unitPrice: 700,
    amount: 35000,
    orderDate: '2025-07-29',
    dueDate: '2025-08-01',
    status: '불합격',
    inspector: '박민수'
  },
  {
    inspectionNo: 'MITEST-A03',
    receiptNo: 'RCPT-0003',
    materialCode: 'WD00005',
    materialName: '합판',
    qty: 150,
    unitPrice: 500,
    amount: 75000,
    orderDate: '2025-07-30',
    dueDate: '2025-08-02',
    status: '합격',
    inspector: '김하늘'
  },
  {
    inspectionNo: 'MITEST-A03',
    receiptNo: 'RCPT-0003',
    materialCode: 'WD00005',
    materialName: '합판',
    qty: 150,
    unitPrice: 500,
    amount: 75000,
    orderDate: '2025-07-30',
    dueDate: '2025-08-02',
    status: '합격',
    inspector: '김하늘'
  },
  {
    inspectionNo: 'MITEST-A03',
    receiptNo: 'RCPT-0003',
    materialCode: 'WD00005',
    materialName: '합판',
    qty: 150,
    unitPrice: 500,
    amount: 75000,
    orderDate: '2025-07-30',
    dueDate: '2025-08-02',
    status: '합격',
    inspector: '김하늘'
  },
  {
    inspectionNo: 'MITEST-A03',
    receiptNo: 'RCPT-0003',
    materialCode: 'WD00005',
    materialName: '합판',
    qty: 150,
    unitPrice: 500,
    amount: 75000,
    orderDate: '2025-07-30',
    dueDate: '2025-08-02',
    status: '합격',
    inspector: '김하늘'
  },
  {
    inspectionNo: 'MITEST-A03',
    receiptNo: 'RCPT-0003',
    materialCode: 'WD00005',
    materialName: '합판',
    qty: 150,
    unitPrice: 500,
    amount: 75000,
    orderDate: '2025-07-30',
    dueDate: '2025-08-02',
    status: '합격',
    inspector: '김하늘'
  },
  {
    inspectionNo: 'MITEST-A03',
    receiptNo: 'RCPT-0003',
    materialCode: 'WD00005',
    materialName: '합판',
    qty: 150,
    unitPrice: 500,
    amount: 75000,
    orderDate: '2025-07-30',
    dueDate: '2025-08-02',
    status: '합격',
    inspector: '김하늘'
  },
  {
    inspectionNo: 'MITEST-A03',
    receiptNo: 'RCPT-0003',
    materialCode: 'WD00005',
    materialName: '합판',
    qty: 150,
    unitPrice: 500,
    amount: 75000,
    orderDate: '2025-07-30',
    dueDate: '2025-08-02',
    status: '합격',
    inspector: '김하늘'
  }
]);

// 행 클릭 이벤트 핸들러
const onRowClicked = (event: any) => {
  const rowData = event.data;
  console.log('클릭된 행:', rowData);

  // /qm/qrdpass 경로로 이동하면서 데이터 전달
  router.push({
    path: '/qm/matmng',
    query: {
      receiptNo: rowData.receiptNo
    }
  });

  // 또는 단순히 경로만 이동하고 싶다면:
  // router.push('/qm/qrdpass');
};

const colDefs: Ref<ColDef<Row>[]> = ref([
  { headerName: '검사번호', field: 'inspectionNo', minWidth: 130, resizable: true },
  { headerName: '입고번호', field: 'receiptNo', minWidth: 120, resizable: true },
  { headerName: '자재코드', field: 'materialCode', minWidth: 120, resizable: true },
  { headerName: '자재명', field: 'materialName', minWidth: 120, resizable: true },
  { headerName: '수량', field: 'qty', type: 'rightAligned', resizable: true },
  {
    headerName: '단가',
    field: 'unitPrice',
    type: 'rightAligned',
    valueFormatter: (p) => (p.value ?? 0).toLocaleString(),
    resizable: false
  },
  { headerName: '금액', field: 'amount', type: 'rightAligned', valueFormatter: (p) => (p.value ?? 0).toLocaleString(), resizable: true },
  { headerName: '발주일자', field: 'orderDate', minWidth: 120, resizable: true },
  { headerName: '납기일자', field: 'dueDate', minWidth: 120, resizable: true },
  { headerName: '처리상태', field: 'status', minWidth: 100, resizable: true },
  { headerName: '검수확인인', field: 'inspector', minWidth: 110, resizable: true }
]);

// ----- 상단 필터를 적용한 그리드 데이터 -----
const gridData = computed(() => {
  const name = form.supplier.trim().toLowerCase();
  const status = form.contact.trim().toLowerCase();
  const from = form.orderDate || '';
  const to = form.dueDate || '';

  return rowData.value.filter((r) => {
    const byName = !name || r.materialName.toLowerCase().includes(name);
    const byStatus = !status || r.status.toLowerCase().includes(status);
    const byFrom = !from || r.orderDate >= from;
    const byTo = !to || r.dueDate <= to;
    return byName && byStatus && byFrom && byTo;
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
  form.supplier = '';
  form.contact = '';
  form.orderDate = '';
  form.dueDate = '';
}
</script>

<style scoped>
.mr2 {
  margin-right: 100px;
}
</style>
