<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <UiParentCard>
    <v-row class="mb-4">
      <v-col cols="3">
        <v-text-field label="입고일자" v-model="form.dueDate" type="date" dense outlined />
      </v-col>
      <v-col cols="3">
        <v-text-field label="자재코드" v-model="form.contact" dense outlined />
      </v-col>
      <v-col cols="3">
        <!-- 처리상태를 드롭다운으로 변경 -->
        <v-select label="상태" v-model="form.status" :items="statusOptions" item-title="label" item-value="value" dense outlined />
      </v-col>
      <!-- 모달-->

      <!-- 버튼 -->
      <v-row justify="end">
        <v-btn color="error" variant="elevated" @click="resetForm">초기화</v-btn>
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
import axios from 'axios';
import { useRouter } from 'vue-router';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { ref, shallowRef, reactive, computed, type Ref, onMounted } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { AllCommunityModule, ModuleRegistry, themeQuartz, type ColDef, PaginationModule, type GridOptions } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule, PaginationModule]);
const quartz = themeQuartz;
const router = useRouter();

// ----- 기존 breadcrumb -----
const page = ref({ title: '원자재검수관리' });
const breadcrumbs = shallowRef([
  { title: '품질', disabled: true, href: '#' },
  { title: '원자재검수관리', disabled: false, href: '#' }
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
  receiptNo: number; // 입고번호
  receiptDate: string; // 입고일자
  supplyer: string; // 공급처
  materialCode: string; // 자재코드
  receivedQty: number; // 입고수량
  matStatus: string; // 상태  // 입고, 검수대기, 검수완료 값이 존재=> 품질은 전부 조회하면서 검수대기가 주력 포인트가 될듯?
}
const rowData: Ref<Row[]> = ref([
  {
    receiptNo: 1001,
    receiptDate: '2025-07-30',
    supplyer: '원목세상',
    materialCode: 'MT1001',
    receivedQty: 100,
    matStatus: '입고'
  },
  {
    receiptNo: 1002,
    receiptDate: '2025-07-31',
    supplyer: '합판세상',
    materialCode: 'MT1002',
    receivedQty: 200,
    matStatus: '입고'
  },
  {
    receiptNo: 1003,
    receiptDate: '2025-08-01',
    supplyer: '원목세상',
    materialCode: 'MT1001',
    receivedQty: 50,
    matStatus: '검수대기'
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
  { headerName: '입고번호', field: 'receiptNo', flex: 1, resizable: true },
  { headerName: '입고일자', field: 'receiptDate', flex: 1, resizable: true },
  { headerName: '공급처', field: 'supplyer', flex: 1, resizable: true },
  { headerName: '자재코드', field: 'materialCode', flex: 1, resizable: true },
  { headerName: '입고수량', field: 'receivedQty', resizable: true },
  { headerName: '상태', field: 'matStatus', flex: 1, resizable: true }
]);

// ----- 상단 필터를 적용한 그리드 데이터 -----
const gridData = computed(() => {
  const name = form.supplier.trim().toLowerCase();
  const status = form.contact.trim().toLowerCase();
  const from = form.orderDate || '';

  return rowData.value.filter((r) => {
    const byName = !name || r.materialCode.toLowerCase().includes(name);
    const byStatus = !status || r.matStatus.toLowerCase().includes(status);
    const byFrom = !from || r.receiptDate >= from;
    return byName && byStatus && byFrom;
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
}

// const getMtrList = async () => {
//   const result = await axios.get('http://localhost:3000/prdcertlist');
// };

// // db 연결
// const getPrdList = async () => {
//   try {
//     const result = await axios.get('http://localhost:3000/prdcertlist');

//     // DB 응답 데이터를 rowData에 매핑
//     if (result.data.length > 0) {
//       // DB 필드명을 Vue 컴포넌트에서 사용하는 필드명으로 매핑
//       rowData.value = result.data.map((item) => ({
//         certId: item.PRD_CERT_ID || item.certId,
//         prdCode: item.PRD_ID || item.prdCode,
//         prdName: item.PRD_NAME || item.prdName,
//         chkedDate: item.Q_CHECKED_DATE || item.chkedDate,
//         prdType: item.PRD_STATUS || item.prdType
//       }));
//     }
//   } catch (err) {
//     console.error(err);
//   }
// };

// 공통코드 처리상태(자재에서 )
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
