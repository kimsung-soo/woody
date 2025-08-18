<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <UiParentCard>
    <v-row class="mb-4">
      <v-col cols="3">
        <v-text-field label="입고일자" v-model="form.receiptNo" type="date" dense outlined />
      </v-col>
      <v-col cols="3">
        <v-text-field label="자재코드" v-model="form.materialCode" dense outlined />
      </v-col>
      <v-col cols="3">
        <!-- 처리상태를 드롭다운으로 변경 -->
        <v-select
          label="상태"
          v-model="form.materialStatus"
          :items="statusOptions"
          item-title="label"
          item-value="value"
          dense
          outlined
          clearable
        />
      </v-col>
      <v-col cols="3">
        <!-- 검색 버튼 추가 -->
        <v-btn color="primary" variant="elevated" @click="searchData">검색</v-btn>
      </v-col>
    </v-row>

    <!-- 버튼 -->
    <v-row justify="end" class="mb-4">
      <v-btn color="error" variant="elevated" @click="resetForm">초기화</v-btn>
    </v-row>

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

// 검색열
interface FormType {
  receiptNo: string; // 입고일자
  materialCode: string; // 자재코드
  materialStatus: string; // 상태
}

const form = reactive<FormType>({
  receiptNo: '',
  materialCode: '',
  materialStatus: ''
});

// ----- ag-Grid용 행 타입/데이터/컬럼 -----
interface Row {
  receiptNo: string;
  receiptDate: string;
  supplyer: string;
  materialCode: string;
  receivedQty: number;
  matStatus: string;
}

const rowData: Ref<Row[]> = ref([]);

// 행 클릭 이벤트 핸들러
const onRowClicked = (event: any) => {
  const clickedRowData = event.data;
  console.log('클릭된 행:', clickedRowData);

  // /qm/matmng 경로로 이동하면서 데이터 전달
  router.push({
    path: '/qm/matmng',
    query: {
      receiptNo: clickedRowData.receiptNo.toString()
    }
  });
};

function coalesce<T = any>(...vals: any[]): T {
  for (const v of vals) if (v !== undefined && v !== null && v !== '') return v as T;
  return '' as unknown as T;
}

function fmtDate(d: any): string {
  if (!d) return '';
  // d가 '2025-08-17T15:00:00.000Z' 형태면 날짜부분만 사용
  try {
    const iso = new Date(d);
    if (!isNaN(iso.getTime())) return iso.toISOString().slice(0, 10); // YYYY-MM-DD
  } catch (_) {}
  // 이미 'YYYY-MM-DD'면 그대로
  const s = String(d);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // 'YYYYMMDD'면 변환
  if (/^\d{8}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6)}`;
  return s;
}

const getMaterialList = async () => {
  try {
    const { data } = await axios.get('http://localhost:3000/matmng');

    if (Array.isArray(data) && data.length > 0) {
      rowData.value = data.map((item: any): Row => {
        // 입고번호: 숫자 변환 금지 (문자형 코드 허용)
        const receiptNo = coalesce(item.RECEIPT_NO, item.receiptNo, item.receipt_no, item.MCERT_NO);
        // 날짜 포맷
        const receiptDate = fmtDate(coalesce(item.RECEIPT_DATE, item.receiptDate, item.receipt_dt, item.inDate));
        // 공급처
        const supplyer = coalesce(item.SUPPLIER, item.supplier, item.SUPPLYER, item.supplyer);
        // 자재코드: MAT_CODE도 함께 확인
        const materialCode = coalesce(item.MAT_CODE, item.MATERIAL_CODE, item.materialCode, item.MATL_CD);
        // 수량: 숫자로 파싱
        const receivedQty = Number(coalesce(item.RECEIVED_QTY, item.receivedQty, item.RCV_QTY, item.qty, 0)) || 0;
        // 상태
        const matStatus = coalesce(item.TMP_STATUS, item.matStatus, item.STATUS, item.status);
        return { receiptNo, receiptDate, supplyer, materialCode, receivedQty, matStatus };
      });
    } else {
      rowData.value = [];
    }
  } catch (err) {
    console.error('원자재 데이터 로드 실패:', err);
  }
};

interface Row {
  receiptNo: string;
  receiptDate: string;
  supplyer: string;
  materialCode: string;
  receivedQty: number;
  matStatus: string;
}

const colDefs: Ref<ColDef<Row>[]> = ref([
  { headerName: '입고번호', field: 'receiptNo', flex: 1, resizable: true },
  { headerName: '입고일자', field: 'receiptDate', flex: 1, resizable: true },
  { headerName: '공급처', field: 'supplyer', flex: 1, resizable: true },
  { headerName: '자재코드', field: 'materialCode', flex: 1, resizable: true },
  { headerName: '입고수량', field: 'receivedQty', flex: 1, resizable: true },
  { headerName: '상태', field: 'matStatus', flex: 1, resizable: true }
]);

// ----- 상단 필터를 적용한 그리드 데이터 -----
const gridData = computed(() => {
  const materialCode = form.materialCode.trim().toLowerCase(); // 자재코드
  const status = form.materialStatus?.trim().toLowerCase() || ''; // 상태
  const dateFilter = form.receiptNo || ''; // 입고일자

  return rowData.value.filter((r) => {
    const byMaterialCode = !materialCode || r.materialCode.toLowerCase().includes(materialCode);
    const byStatus = !status || r.matStatus.toLowerCase().includes(status);
    const byDate = !dateFilter || r.receiptDate >= dateFilter;

    return byMaterialCode && byStatus && byDate;
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
  form.receiptNo = '';
  form.materialCode = '';
  form.materialStatus = '';
}

function searchData(): void {
  // 검색 버튼 클릭 시 필터링은 computed에서 자동으로 처리됨
  console.log('검색 조건:', {
    입고일자: form.receiptNo,
    자재코드: form.materialCode,
    상태: form.materialStatus
  });
}

// 공통코드 처리상태
interface StatusOption {
  label: string;
  value: string;
}

const statusOptions = ref<StatusOption[]>([{ label: '검수대기', value: '' }]);

// 처리상태 옵션 불러오기 (기존 함수는 제거하고 getMatStatus 사용)
const getStatusOptions = async () => {
  try {
    const result = await axios.get('http://localhost:3000/qccommon');
    if (result.data && result.data.length > 0) {
      statusOptions.value = [
        { label: '검수대기', value: '' },
        ...result.data.map((item: any) => ({
          label: item.code_name,
          value: item.code
        }))
      ];
    }
  } catch (err) {
    console.error('상태 옵션 로드 실패:', err);
  }
};

// ----- 컴포넌트 마운트 시 데이터 로드 -----
onMounted(() => {
  getStatusOptions();
  getMaterialList();
});
</script>

<style scoped>
.mr2 {
  margin-right: 100px;
}
</style>
