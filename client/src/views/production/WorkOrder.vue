<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="작업지시 등록">
    <!-- 우측 상단 버튼 -->
    <div class="d-flex justify-end mb-6">
      <v-btn color="warning" class="mr-2" @click="openPlanDialog">계획서 조회</v-btn>
    </div>

    <!-- 상단 입력 -->
    <v-row class="mb-6">
      <v-col cols="4">
        <v-text-field label="지시번호" v-model="form.issueNumber" readonly placeholder="지시번호" dense outlined />
      </v-col>
      <v-col cols="4">
        <v-text-field label="지시일자" v-model="form.orderDate" type="date" dense outlined />
      </v-col>
      <v-col cols="4">
        <v-text-field label="작성자" v-model="form.contact" dense outlined />
      </v-col>

      <v-col cols="4">
        <v-text-field label="제품코드" v-model="form.productCode" readonly placeholder="제품코드" dense outlined />
      </v-col>
      <v-col cols="4">
        <v-text-field label="납기일자" v-model="form.dueDate" type="date" dense outlined />
      </v-col>
      <v-col cols="4">
        <v-text-field label="목표수량" v-model.number="form.targetQty" type="number" min="0" step="1" dense outlined @input="recalcNeed" />
      </v-col>

      <v-col cols="4">
        <v-text-field label="제품명칭" v-model="form.productName" dense outlined readonly />
      </v-col>
    </v-row>

    <!-- 좌/우: 제품선택 / BOM + WIP -->
    <v-row align="start" class="mb-2">
      <!-- 좌: 제품선택 -->
      <v-col cols="12" md="6">
        <v-row class="mb-2" align="center" no-gutters>
          <v-col cols="6"><h3 class="mb-2">제품선택</h3></v-col>
          <v-col cols="6" class="d-flex justify-end">
            <v-text-field
              v-model.trim="productKeyword"
              placeholder="제품코드/명 검색"
              hide-details
              density="compact"
              variant="outlined"
              style="max-width: 240px"
              @keyup.enter="doProductSearch"
            />
            <!-- <v-btn class="ml-2" color="darkText" size="large" @click="doProductSearch">검색</v-btn> -->
          </v-col>
        </v-row>

        <div class="table-block">
          <v-table class="tbl-sm nowrap" density="compact">
            <thead>
              <tr>
                <th>선택</th>
                <th>제품코드</th>
                <th>제품명</th>
                <th>유형</th>
                <th>단위</th>
                <th>규격</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in pagedProducts" :key="p.code">
                <td class="t-center">
                  <v-radio-group v-model="selectedProduct" inline hide-details density="compact" class="radio-compact">
                    <v-radio :value="p.code" @change="onPickProduct(p)" />
                  </v-radio-group>
                </td>
                <td>{{ p.code }}</td>
                <td>{{ p.name }}</td>
                <td>{{ p.type }}</td>
                <td>{{ p.uom }}</td>
                <td>{{ p.spec }}</td>
              </tr>
              <!-- 고정 높이 유지용 패딩 -->
              <tr v-for="n in productPad" :key="'ppad' + n" class="pad-row">
                <td colspan="6">&nbsp;</td>
              </tr>
            </tbody>
          </v-table>

          <div class="pager">
            <span class="page-info">{{ prodPage }} / {{ prodTotalPages }}</span>
            <v-pagination v-model="prodPage" :length="prodTotalPages" density="comfortable" size="small" />
          </div>
        </div>
      </v-col>

      <!-- 우: BOM + WIP -->
      <v-col cols="12" md="6">
        <h3 class="mb-2">BOM 목록</h3>
        <div class="table-block">
          <v-table class="tbl-sm nowrap" density="compact">
            <thead>
              <tr>
                <th>순번</th>
                <th>자재코드</th>
                <th>자재명</th>
                <th>자재유형</th>
                <th class="t-right">단위별수량</th>
                <th>규격</th>
                <th class="t-right">재공수량</th>
                <th class="t-right">필요수량</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in pagedBom" :key="b.seq + b.matCode">
                <td class="t-right">{{ b.seq }}</td>
                <td>{{ b.matCode }}</td>
                <td>{{ b.matName }}</td>
                <td>{{ b.matType }}</td>
                <td class="t-right">{{ b.perUnit }}</td>
                <td>{{ b.spec }}</td>
                <td class="t-right">{{ b.wipQty }}</td>
                <td class="t-right strong">{{ b.needQty }}</td>
              </tr>
              <tr v-for="n in bomPad" :key="'bpad' + n" class="pad-row">
                <td colspan="8">&nbsp;</td>
              </tr>
            </tbody>
          </v-table>
          <div class="pager">
            <span class="page-info">{{ bomPage }} / {{ bomTotalPages }}</span>
            <v-pagination v-model="bomPage" :length="bomTotalPages" density="comfortable" size="small" />
          </div>
        </div>

        <h3 class="mb-2 mt-6">재공품현황</h3>
        <div class="table-block">
          <v-table class="tbl-wip nowrap" density="compact">
            <thead>
              <tr>
                <th>원자재유형</th>
                <th class="t-right">수량</th>
                <th>규격</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in pagedWip" :key="w.type + w.spec">
                <td>{{ w.type }}</td>
                <td class="t-right">{{ w.qty }}</td>
                <td>{{ w.spec }}</td>
              </tr>
              <tr v-for="n in wipPad" :key="'wpad' + n" class="pad-row">
                <td colspan="3">&nbsp;</td>
              </tr>
            </tbody>
          </v-table>
          <div class="pager">
            <span class="page-info">{{ wipPage }} / {{ wipTotalPages }}</span>
            <v-pagination v-model="wipPage" :length="wipTotalPages" density="comfortable" size="small" />
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- 하단 버튼 -->
    <v-row justify="end">
      <v-btn color="error" class="mr-2" @click="resetForm">초기화</v-btn>
      <v-btn color="success" @click="submitForm">저장</v-btn>
    </v-row>
  </UiParentCard>

  <!-- ====== 계획서 조회 모달 ====== -->
  <v-dialog v-model="planDialog" width="90vw">
    <v-card class="plan-card">
      <v-card-title class="d-flex align-center justify-space-between">
        <span>계획서 목록</span>
        <div class="d-flex align-center" style="gap: 8px">
          <v-text-field
            v-model.trim="planKeyword"
            placeholder="계획번호/제품코드/제품명 검색"
            hide-details
            density="compact"
            variant="outlined"
            style="width: 320px"
            @keyup.enter="doPlanSearch"
          />
          <!-- <v-btn color="darkText" size="small" @click="doPlanSearch">검색</v-btn> -->
        </div>
      </v-card-title>

      <v-card-text class="dialog-body">
        <div class="table-block">
          <v-table class="tbl-sm nowrap" density="compact">
            <thead>
              <tr>
                <th>선택</th>
                <th>순번</th>
                <th>계획번호</th>
                <th>계획명</th>
                <th>주문코드</th>
                <th>제품코드</th>
                <th>제품명</th>
                <th>유형</th>
                <th>작성일시</th>
                <th>작성자</th>
                <th class="t-right">총수량</th>
                <th>납기일자</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in pagedPlans" :key="r.id">
                <td class="t-center">
                  <v-checkbox :model-value="isPlanChecked(r.id)" density="compact" hide-details @update:model-value="() => togglePlan(r)" />
                </td>
                <td class="t-right">{{ r.seq }}</td>
                <td>{{ r.planNo }}</td>
                <td>{{ r.planName }}</td>
                <td>{{ r.orderNo }}</td>
                <td>{{ r.productCode }}</td>
                <td>{{ r.productName }}</td>
                <td>{{ r.productType }}</td>
                <td>{{ r.createdAt }}</td>
                <td>{{ r.writer }}</td>
                <td class="t-right">{{ r.totalQty }}</td>
                <td>{{ r.dueDate }}</td>
              </tr>
              <tr v-for="n in planPad" :key="'ppad2' + n" class="pad-row">
                <td colspan="12">&nbsp;</td>
              </tr>
            </tbody>
          </v-table>
          <div class="pager">
            <span class="page-info">{{ planPage }} / {{ planTotalPages }}</span>
            <v-pagination v-model="planPage" :length="planTotalPages" density="comfortable" size="small" />
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="tonal" @click="planDialog = false">닫기</v-btn>
        <v-btn color="primary" @click="applyPlans">등록</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, shallowRef, reactive, watch, computed, onMounted } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const page = ref({ title: '작업지시 관리' });
const breadcrumbs = shallowRef([
  { title: '생산', disabled: true, href: '#' },
  { title: '작업지시 관리', disabled: false, href: '#' }
]);

/* ---------- 폼 ---------- */
const form = reactive({
  issueNumber: '',
  orderDate: '',
  contact: '',
  productCode: '',
  productName: '',
  dueDate: '',
  targetQty: 10
});

/* 자동발번 */
function genIssueNo() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rnd = Math.floor(Math.random() * 9000 + 1000);
  return `WO-${y}${m}${day}-${rnd}`;
}
onMounted(() => {
  if (!form.issueNumber) form.issueNumber = genIssueNo();
  if (!form.orderDate) form.orderDate = new Date().toISOString().slice(0, 10);
});

/* ---------- 제품 데이터 ---------- */
type Product = { code: string; name: string; uom: string; spec: string; type: string };
type Bom = {
  seq: number;
  matCode: string;
  matName: string;
  matType: string;
  perUnit: number;
  spec: string;
  wipQty: number;
  needQty: number;
};
type Wip = { type: string; qty: number; spec: string };

/* 제품 더미 데이터 (페이지네이션 확인용 18개) */
const productRows = ref<Product[]>([
  { code: 'P001', name: '블랙 데스크', uom: 'EA', spec: '1200x600', type: '완제품' },
  { code: 'P002', name: '화이트 데스크', uom: 'EA', spec: '1200x600', type: '완제품' },
  { code: 'P003', name: '블랙 데스크(소형)', uom: 'EA', spec: '1000x600', type: '완제품' },
  { code: 'P004', name: '라운드 테이블', uom: 'EA', spec: 'Ø900', type: '완제품' },
  { code: 'P005', name: '워런트 책상', uom: 'EA', spec: '1400x700', type: '완제품' },
  { code: 'P006', name: '메이플 책상', uom: 'EA', spec: '1200x600', type: '완제품' },
  { code: 'P007', name: '오크 책상', uom: 'EA', spec: '1000x500', type: '완제품' },
  { code: 'P008', name: '화이트 보드', uom: 'EA', spec: '1200x900', type: '완제품' },
  { code: 'P009', name: '블랙 보드', uom: 'EA', spec: '1200x900', type: '완제품' },
  { code: 'P010', name: '철제 선반(소)', uom: 'EA', spec: '900x400', type: '완제품' },
  { code: 'P011', name: '철제 선반(대)', uom: 'EA', spec: '1200x400', type: '완제품' },
  { code: 'P012', name: '원목 선반', uom: 'EA', spec: '1000x350', type: '완제품' },
  { code: 'P013', name: '협탁', uom: 'EA', spec: '500x500', type: '완제품' },
  { code: 'P014', name: '수납장(소)', uom: 'EA', spec: '800x400', type: '완제품' },
  { code: 'P015', name: '수납장(대)', uom: 'EA', spec: '1200x400', type: '완제품' },
  { code: 'P016', name: '원형 테이블(소)', uom: 'EA', spec: 'Ø700', type: '완제품' },
  { code: 'P017', name: '원형 테이블(대)', uom: 'EA', spec: 'Ø1200', type: '완제품' },
  { code: 'P018', name: '유리 테이블', uom: 'EA', spec: '1000x600', type: '완제품' }
]);

/* 간단한 BOM/WIP 맵 (없는 제품은 기본 1EA 상판/다리 세팅) */
const bomMap: Record<string, Bom[]> = {
  P001: [
    { seq: 1, matCode: 'PP12', matName: '상판', matType: '원자재', perUnit: 1, spec: '1200x600', wipQty: 3, needQty: 0 },
    { seq: 2, matCode: 'PP48', matName: '다리', matType: '부자재', perUnit: 4, spec: '-', wipQty: 8, needQty: 0 },
    { seq: 3, matCode: 'SC01', matName: '나사세트', matType: '부자재', perUnit: 12, spec: 'M6', wipQty: 30, needQty: 0 }
  ],
  P002: [
    { seq: 1, matCode: 'PP15', matName: '상판(화이트)', matType: '원자재', perUnit: 1, spec: '1200x600', wipQty: 1, needQty: 0 },
    { seq: 2, matCode: 'PP49', matName: '다리(화이트)', matType: '부자재', perUnit: 4, spec: '-', wipQty: 4, needQty: 0 }
  ],
  P003: [
    { seq: 1, matCode: 'PP48S', matName: '상판(소형)', matType: '원자재', perUnit: 1, spec: '1000x600', wipQty: 5, needQty: 0 },
    { seq: 2, matCode: 'PPF3', matName: '받침대(소형)', matType: '부자재', perUnit: 2, spec: '-', wipQty: 2, needQty: 0 }
  ],
  P004: [
    { seq: 1, matCode: 'RD01', matName: '라운드상판', matType: '원자재', perUnit: 1, spec: 'Ø900', wipQty: 2, needQty: 0 },
    { seq: 2, matCode: 'LEG4', matName: '다리세트', matType: '부자재', perUnit: 4, spec: '-', wipQty: 6, needQty: 0 }
  ]
};
const wipMap: Record<string, Wip[]> = {
  P001: [
    { type: '원목', qty: 10, spec: '800x400' },
    { type: '합판', qty: 12, spec: '1000x600' }
  ],
  P002: [
    { type: '원목', qty: 4, spec: '800x400' },
    { type: '합판', qty: 6, spec: '1200x600' }
  ],
  P003: [{ type: '원목', qty: 2, spec: '700x400' }],
  P004: [{ type: '합판', qty: 5, spec: 'Ø900' }]
};
/* 기본 BOM/WIP 생성기(맵에 없을 때) */
function makeDefaultBom(p: Product): Bom[] {
  return [
    { seq: 1, matCode: `${p.code}-TOP`, matName: '상판', matType: '원자재', perUnit: 1, spec: p.spec, wipQty: 0, needQty: 0 },
    { seq: 2, matCode: `${p.code}-LEG`, matName: '다리', matType: '부자재', perUnit: 4, spec: '-', wipQty: 0, needQty: 0 }
  ];
}
function makeDefaultWip(p: Product): Wip[] {
  return [{ type: '원목', qty: 0, spec: p.spec }];
}

/* 표시 rows */
const bomRows = ref<Bom[]>([]);
const wipRows = ref<Wip[]>([]);

/* 제품 선택 & 검색 */
const selectedProduct = ref<string | null>(productRows.value[0]?.code ?? null);
const productKeyword = ref('');

/* === 제품 페이지네이션: 1페이지 10행 === */
const PROD_PAGE_SIZE = 10;
const filteredProducts = computed(() => {
  const kw = productKeyword.value.trim().toLowerCase();
  if (!kw) return productRows.value;
  return productRows.value.filter((p) => p.code.toLowerCase().includes(kw) || p.name.toLowerCase().includes(kw));
});
const prodPage = ref(1);
const prodTotalPages = computed(() => Math.max(1, Math.ceil(filteredProducts.value.length / PROD_PAGE_SIZE)));
const pagedProducts = computed(() => {
  const start = (prodPage.value - 1) * PROD_PAGE_SIZE;
  return filteredProducts.value.slice(start, start + PROD_PAGE_SIZE);
});
const productPad = computed(() => Math.max(0, PROD_PAGE_SIZE - pagedProducts.value.length));
function doProductSearch() {
  prodPage.value = 1;
}

function onPickProduct(p: Product) {
  form.productCode = p.code;
  form.productName = p.name;
  loadBomAndWip(p.code);
}
function loadBomAndWip(productCode: string) {
  const p = productRows.value.find((x) => x.code === productCode);
  const bom = bomMap[productCode] ?? (p ? makeDefaultBom(p) : []);
  const wip = wipMap[productCode] ?? (p ? makeDefaultWip(p) : []);
  bomRows.value = bom.map((b) => ({ ...b }));
  wipRows.value = wip.map((w) => ({ ...w }));
  recalcNeed();
}

/* 필요수량 */
function recalcNeed() {
  const target = Number(form.targetQty || 0);
  bomRows.value = bomRows.value.map((b) => ({
    ...b,
    needQty: Math.max(0, target * b.perUnit - (b.wipQty || 0))
  }));
}

/* 초기 로드 */
if (selectedProduct.value) {
  const p = productRows.value.find((x) => x.code === selectedProduct.value)!;
  onPickProduct(p);
}
watch(() => form.targetQty, recalcNeed);

/* === BOM/WIP 페이지네이션: 1페이지 3행 === */
const SUB_PAGE_SIZE = 3;
const bomPage = ref(1);
const wipPage = ref(1);

const bomTotalPages = computed(() => Math.max(1, Math.ceil(bomRows.value.length / SUB_PAGE_SIZE)));
const wipTotalPages = computed(() => Math.max(1, Math.ceil(wipRows.value.length / SUB_PAGE_SIZE)));

const pagedBom = computed(() => {
  const start = (bomPage.value - 1) * SUB_PAGE_SIZE;
  return bomRows.value.slice(start, start + SUB_PAGE_SIZE);
});
const pagedWip = computed(() => {
  const start = (wipPage.value - 1) * SUB_PAGE_SIZE;
  return wipRows.value.slice(start, start + SUB_PAGE_SIZE);
});
const bomPad = computed(() => Math.max(0, SUB_PAGE_SIZE - pagedBom.value.length));
const wipPad = computed(() => Math.max(0, SUB_PAGE_SIZE - pagedWip.value.length));

watch(
  bomRows,
  () => {
    bomPage.value = 1;
  },
  { deep: true }
);
watch(
  wipRows,
  () => {
    wipPage.value = 1;
  },
  { deep: true }
);

/* ====== 계획서 모달 ====== */
type PlanRow = {
  id: string;
  seq: number;
  planNo: string;
  planName: string;
  orderNo: string;
  productCode: string;
  productName: string;
  productType: string;
  createdAt: string;
  writer: string;
  totalQty: number;
  dueDate: string;
};

const planDialog = ref(false);
const planKeyword = ref('');
const planPage = ref(1);
const PLAN_PAGE_SIZE = 10;
const checkedPlanIds = ref<string[]>([]);

/* 더미 계획 데이터(다수 페이지) — 같은 제품끼리 여러 건 존재 */
const planRows = ref<PlanRow[]>([
  {
    id: '1',
    seq: 1,
    planNo: 'ABC-1234',
    planName: '예방물량',
    orderNo: 'QWE-123',
    productCode: 'P001',
    productName: '블랙 데스크',
    productType: '완제품',
    createdAt: '2025-07-28',
    writer: '이동현',
    totalQty: 100,
    dueDate: '2025-08-30'
  },
  {
    id: '2',
    seq: 2,
    planNo: 'ABC-2234',
    planName: '월간생산',
    orderNo: 'QWE-125',
    productCode: 'P001',
    productName: '블랙 데스크',
    productType: '완제품',
    createdAt: '2025-07-26',
    writer: '김찬용',
    totalQty: 200,
    dueDate: '2025-08-25'
  },
  {
    id: '3',
    seq: 3,
    planNo: 'ABD-1234',
    planName: '재고보충',
    orderNo: 'QWE-128',
    productCode: 'P002',
    productName: '화이트 데스크',
    productType: '완제품',
    createdAt: '2025-06-26',
    writer: '계근영',
    totalQty: 150,
    dueDate: '2025-07-21'
  },
  {
    id: '4',
    seq: 4,
    planNo: 'ABC-3234',
    planName: '월말증산',
    orderNo: 'QWE-223',
    productCode: 'P003',
    productName: '블랙 데스크(소형)',
    productType: '완제품',
    createdAt: '2025-02-09',
    writer: '김상우',
    totalQty: 260,
    dueDate: '2025-04-30'
  },
  {
    id: '5',
    seq: 5,
    planNo: 'ABC-1334',
    planName: '특판',
    orderNo: 'QWE-133',
    productCode: 'P003',
    productName: '블랙 데스크(소형)',
    productType: '완제품',
    createdAt: '2025-01-01',
    writer: '최은수',
    totalQty: 50,
    dueDate: '2025-03-28'
  },
  {
    id: '6',
    seq: 6,
    planNo: 'AXC-1234',
    planName: '샘플',
    orderNo: 'QWE-555',
    productCode: 'P004',
    productName: '라운드 테이블',
    productType: '완제품',
    createdAt: '2025-01-05',
    writer: '정창준',
    totalQty: 30,
    dueDate: '2025-06-21'
  },
  {
    id: '7',
    seq: 7,
    planNo: 'AXC-2234',
    planName: '추가생산',
    orderNo: 'QWE-556',
    productCode: 'P001',
    productName: '블랙 데스크',
    productType: '완제품',
    createdAt: '2025-08-01',
    writer: '박유진',
    totalQty: 70,
    dueDate: '2025-09-01'
  },
  {
    id: '8',
    seq: 8,
    planNo: 'AXC-3234',
    planName: '이벤트',
    orderNo: 'QWE-557',
    productCode: 'P002',
    productName: '화이트 데스크',
    productType: '완제품',
    createdAt: '2025-08-02',
    writer: '문수현',
    totalQty: 40,
    dueDate: '2025-09-05'
  },
  // 추가 페이지용
  {
    id: '9',
    seq: 9,
    planNo: 'BCD-1001',
    planName: '월차증산',
    orderNo: 'QWE-600',
    productCode: 'P004',
    productName: '라운드 테이블',
    productType: '완제품',
    createdAt: '2025-07-10',
    writer: '김도윤',
    totalQty: 60,
    dueDate: '2025-08-15'
  },
  {
    id: '10',
    seq: 10,
    planNo: 'BCD-1002',
    planName: '월차증산',
    orderNo: 'QWE-601',
    productCode: 'P004',
    productName: '라운드 테이블',
    productType: '완제품',
    createdAt: '2025-07-12',
    writer: '김도윤',
    totalQty: 80,
    dueDate: '2025-08-20'
  },
  {
    id: '11',
    seq: 11,
    planNo: 'EFG-2001',
    planName: '이월분',
    orderNo: 'QWE-700',
    productCode: 'P002',
    productName: '화이트 데스크',
    productType: '완제품',
    createdAt: '2025-06-05',
    writer: '장민희',
    totalQty: 120,
    dueDate: '2025-07-05'
  },
  {
    id: '12',
    seq: 12,
    planNo: 'EFG-2002',
    planName: '이월분',
    orderNo: 'QWE-701',
    productCode: 'P002',
    productName: '화이트 데스크',
    productType: '완제품',
    createdAt: '2025-06-08',
    writer: '장민희',
    totalQty: 30,
    dueDate: '2025-07-08'
  },
  {
    id: '13',
    seq: 13,
    planNo: 'HIJ-3001',
    planName: '특판2',
    orderNo: 'QWE-800',
    productCode: 'P001',
    productName: '블랙 데스크',
    productType: '완제품',
    createdAt: '2025-07-30',
    writer: '오유나',
    totalQty: 90,
    dueDate: '2025-08-31'
  },
  {
    id: '14',
    seq: 14,
    planNo: 'HIJ-3002',
    planName: '특판3',
    orderNo: 'QWE-801',
    productCode: 'P001',
    productName: '블랙 데스크',
    productType: '완제품',
    createdAt: '2025-07-31',
    writer: '오유나',
    totalQty: 40,
    dueDate: '2025-09-02'
  },
  {
    id: '15',
    seq: 15,
    planNo: 'KLM-4001',
    planName: '신규런칭',
    orderNo: 'QWE-900',
    productCode: 'P003',
    productName: '블랙 데스크(소형)',
    productType: '완제품',
    createdAt: '2025-03-01',
    writer: '윤상우',
    totalQty: 110,
    dueDate: '2025-04-05'
  },
  {
    id: '16',
    seq: 16,
    planNo: 'KLM-4002',
    planName: '신규런칭',
    orderNo: 'QWE-901',
    productCode: 'P003',
    productName: '블랙 데스크(소형)',
    productType: '완제품',
    createdAt: '2025-03-05',
    writer: '윤상우',
    totalQty: 45,
    dueDate: '2025-04-07'
  }
]);

const filteredPlans = computed(() => {
  const kw = planKeyword.value.trim().toLowerCase();
  if (!kw) return planRows.value;
  return planRows.value.filter(
    (r) => r.planNo.toLowerCase().includes(kw) || r.productCode.toLowerCase().includes(kw) || r.productName.toLowerCase().includes(kw)
  );
});
const planTotalPages = computed(() => Math.max(1, Math.ceil(filteredPlans.value.length / PLAN_PAGE_SIZE)));
const pagedPlans = computed(() => {
  const start = (planPage.value - 1) * PLAN_PAGE_SIZE;
  return filteredPlans.value.slice(start, start + PLAN_PAGE_SIZE);
});
const planPad = computed(() => Math.max(0, PLAN_PAGE_SIZE - pagedPlans.value.length));

function doPlanSearch() {
  planPage.value = 1;
}
function isPlanChecked(id: string) {
  return checkedPlanIds.value.includes(id);
}

function togglePlan(row: PlanRow) {
  const idx = checkedPlanIds.value.indexOf(row.id);
  if (idx >= 0) {
    checkedPlanIds.value.splice(idx, 1);
    return;
  }

  // 같은 제품/유형만 다중 선택 허용
  const chosen = planRows.value.find((r) => checkedPlanIds.value[0] === r.id);
  if (chosen) {
    if (chosen.productType !== row.productType) {
      window.alert('같은 제품유형만 복수 선택 가능합니다.');
      return;
    }
    if (chosen.productCode !== row.productCode) {
      window.alert('같은 제품만 복수 선택 가능합니다.');
      return;
    }
  }
  checkedPlanIds.value.push(row.id);
}

function openPlanDialog() {
  checkedPlanIds.value = [];
  planKeyword.value = '';
  planPage.value = 1;
  planDialog.value = true;
}

function applyPlans() {
  if (checkedPlanIds.value.length === 0) {
    window.alert('계획서를 선택하세요.');
    return;
  }
  const rows = planRows.value.filter((r) => checkedPlanIds.value.includes(r.id));
  const product = rows[0];

  // 상단 폼 채우기
  if (!form.issueNumber) form.issueNumber = genIssueNo();
  form.productCode = product.productCode;
  form.productName = product.productName;
  form.dueDate = rows.map((r) => r.dueDate).sort()[0]; // 가장 빠른 납기일
  form.targetQty = rows.reduce((sum, r) => sum + r.totalQty, 0); // 총수량 합산
  form.contact = product.writer; // 작성자 기본 셋

  // 좌측 '제품선택'에도 반영 + 필터 이동
  selectedProduct.value = product.productCode;
  productKeyword.value = product.productCode;
  prodPage.value = 1;

  // BOM/WIP 로드 및 필요수량 재계산
  loadBomAndWip(product.productCode);
  recalcNeed();

  planDialog.value = false;
}

/* 저장 */
function submitForm() {
  if (!form.issueNumber) form.issueNumber = genIssueNo();
  if (!form.orderDate || !form.contact || !form.productCode || !form.productName || !form.dueDate) {
    window.alert('필수 항목이 비어있습니다.\n(지시일자, 작성자, 제품, 납기일자)');
    return;
  }
  if (!form.targetQty || form.targetQty <= 0) {
    window.alert('목표수량을 1 이상으로 입력하세요.');
    return;
  }

  console.log('저장 payload', {
    form: { ...form },
    bom: bomRows.value,
    wip: wipRows.value,
    selectedPlanIds: checkedPlanIds.value
  });
  alert('저장(목업). 콘솔 확인!');
}

/* 리셋 */
function resetForm() {
  form.issueNumber = genIssueNo();
  form.orderDate = new Date().toISOString().slice(0, 10);
  form.contact = '';
  form.productCode = '';
  form.productName = '';
  form.dueDate = '';
  form.targetQty = 10;

  selectedProduct.value = productRows.value[0]?.code ?? null;
  if (selectedProduct.value) {
    const p = productRows.value.find((x) => x.code === selectedProduct.value)!;
    onPickProduct(p);
  }
  prodPage.value = bomPage.value = wipPage.value = 1;
}
</script>

<style scoped>
:root {
  --row-h: 36px;
  --row-h-wip: 38px;
}

/* 줄바꿈 금지 */
.nowrap th,
.nowrap td {
  white-space: nowrap;
}

/* 공통 작은 표 */
.tbl-sm thead th,
.tbl-sm tbody td {
  font-size: 12px;
  padding: 6px 8px;
  vertical-align: middle;
  height: var(--row-h);
}

/* 재공품 표는 약간 크게 */
.tbl-wip thead th,
.tbl-wip tbody td {
  font-size: 13.5px;
  padding: 7px 9px;
  vertical-align: middle;
  height: var(--row-h-wip);
}

/* 패딩 행로 고정 높이 유지 */
.pad-row td {
  height: var(--row-h);
  border: none;
  padding: 0;
}
.tbl-wip .pad-row td {
  height: var(--row-h-wip);
}

/* 표 블록 + 하단 고정 pager */
.table-block {
  position: relative;
  padding-bottom: 44px;
  border-radius: 8px;
}
.pager {
  position: absolute;
  right: 0;
  bottom: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.page-info {
  font-size: 12px;
  opacity: 0.7;
}

.t-right {
  text-align: right;
}
.t-center {
  text-align: center;
}
.strong {
  font-weight: 700;
}

/* 라디오 크기 조정 */
.radio-compact :deep(.v-selection-control) {
  height: 18px;
}
.radio-compact :deep(.v-radio) {
  padding: 0;
  margin: 0;
}

.mb-6 {
  margin-bottom: 1.5rem;
}
.mt-6 {
  margin-top: 1.5rem;
}

/* 모달 본문: 세로 길게(최대 80vh) & 스크롤 */
.plan-card .dialog-body {
  max-height: 80vh;
  overflow: auto;
}

/* v-table 기본 너비가 꽉 차게 */
.plan-card :deep(.v-table) {
  width: 100%;
}
</style>
