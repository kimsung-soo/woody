<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard>
    <!-- 상단 툴바 -->
    <div class="toolbar">
      <div class="filters">
        <v-row cols="3">
          <v-text-field label="기준" @keyup.enter="onSearch" dense outlined />
        </v-row>
        <div class="radios">
          <label class="radio">
            <input type="radio" value="완/반제품" v-model="search.type" />
            완/반제품
          </label>
          <label class="radio">
            <input type="radio" value="원목" v-model="search.type" />
            원목
          </label>
          <label class="radio">
            <input type="radio" value="합판" v-model="search.type" />
            합판
          </label>
        </div>

        <button class="btn" @click="onSearch">검색</button>
        <button class="btn ghost" @click="onReset">초기화</button>
      </div>
    </div>

    <!-- 그리드 -->
    <div class="grid-wrap">
      <ag-grid-vue
        :theme="quartz"
        :columnDefs="colDefs"
        :rowData="qcStdRowData"
        :gridOptions="gridOptions"
        rowSelection="single"
        @grid-ready="onGridReady"
        @cell-value-changed="onCellValueChanged"
        style="height: 420px; width: 100%"
      />
    </div>
  </UiParentCard>
</template>

<script setup>
import { ref, shallowRef, computed } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { AgGridVue } from 'ag-grid-vue3';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);
const quartz = themeQuartz;

// 페이지 상단
const page = ref({ title: '품질 기준 조회' });
const breadcrumbs = shallowRef([
  { title: '품질', disabled: true, href: '#' },
  { title: '품질 기준 조회', disabled: false, href: '#' }
]);

// 컬럼 (스샷: 기준 / 검사내용 / 허용수치)
const colDefs = ref([
  { headerName: '기준', field: '기준', flex: 0.9 },
  { headerName: '검사내용', field: '검사내용', flex: 1.4 },
  { headerName: '허용수치', field: '허용수치', flex: 1.3 }
]);

// 타입별 기준 데이터셋 (샘플)
const datasetMap = ref({
  '완/반제품': [
    { 기준: '함수율', 검사내용: '수분 함량 검사', 허용수치: '수분 함량이 12 ~ 13% 이하' },
    { 기준: '치수정밀도', 검사내용: '전체 외형치수, 가공 및 조립 후 치수', 허용수치: '입고자재에서 ± 2mm 이내' },
    { 기준: '강도/내구성', 검사내용: '하중, 휨, 낙하, 반복 사용시험(횡강도, 압축)', 허용수치: '횡강도 35MPa 이상' },
    {
      기준: '안정성',
      검사내용: '전도방지, 전기부 위험, 모서리 안전성 시험',
      허용수치: '전도 없음, 전기부 안전, 모서리 둥글림 위험요소 없음'
    },
    { 기준: '외관 결정', 검사내용: '옹이, 훼절, 균열 등 외관', 허용수치: '옹이, 훼절, 균열 유약확인 시 결점이 없을 시' },
    { 기준: '포름알데히드 방출량', 검사내용: '완제품/반제품 목재의 포름알데히드 방출 시험', 허용수치: '친환경 E0 등급(0.3mg/L)이하' },
    { 기준: '표면 마감/도장', 검사내용: '도막 균일성, 접착력, 내마모성 검사', 허용수치: '도막 들뜸·박리 없음, 균일한 색상·광택 유지' }
  ],
  원목: [
    { 기준: '함수율', 검사내용: '수분 함량 검사', 허용수치: '10 ~ 12% 이하' },
    { 기준: '치수정밀도', 검사내용: '가공 치수 오차 측정', 허용수치: '± 1.5mm 이내' },
    { 기준: '외관', 검사내용: '옹이/균열/뒤틀림', 허용수치: '구조적 강성 저하 없음' }
  ],
  합판: [
    { 기준: '겉면 등급', 검사내용: '옹이, 패치, 크랙', 허용수치: '등급 기준 충족(BB/CC 등)' },
    { 기준: '접착 강도', 검사내용: '박리 시험', 허용수치: '기준 이상' },
    { 기준: '포름알데히드', 검사내용: '방출량 시험', 허용수치: 'E0 등급(0.3mg/L)이하' }
  ]
});

// 검색 상태
const search = ref({
  keyword: '', // 기준(입력란)
  type: '완/반제품' // 라디오 선택
});

// 기본 행 + 검색 필터 적용
const baseRows = computed(() => datasetMap.value[search.value.type] ?? []);
const qcStdRowData = computed(() => {
  const kw = (search.value.keyword || '').trim().toLowerCase();
  if (!kw) return baseRows.value;
  const toL = (v) => (v ?? '').toString().toLowerCase();
  return baseRows.value.filter((r) => toL(r['기준']).includes(kw) || toL(r['검사내용']).includes(kw) || toL(r['허용수치']).includes(kw));
});

// ag-Grid 옵션/이벤트
const gridOptions = ref({
  defaultColDef: { resizable: true },
  pagination: false,
  animateRows: true
});

let gridApi = null;
const onGridReady = (e) => {
  gridApi = e.api;
};
const onCellValueChanged = () => {
  /* 편집 시 후처리 필요하면 여기에 */
};

// 버튼 액션
const onSearch = () => {
  // 반응형이라 자동으로 갱신되지만, 명시적으로 밀어주고 싶으면 아래 사용
  if (gridApi) gridApi.setGridOption('rowData', qcStdRowData.value);
};
const onReset = () => {
  search.value.keyword = '';
  if (gridApi) gridApi.setGridOption('rowData', baseRows.value);
};
</script>

<style scoped>
.toolbar {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
}
.title {
  font-size: 18px;
  font-weight: 700;
}
.filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
}
.badge {
  background: #e46a2d;
  color: #fff;
  border-radius: 6px;
  padding: 4px 8px;
  font-weight: 700;
}
.lbl {
  margin-left: 4px;
  margin-right: 6px;
}
.input {
  height: 34px;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  min-width: 220px;
}
.radios {
  display: flex;
  gap: 14px;
  margin: 0 6px;
}
.radio {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn {
  height: 34px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid #dcdcdc;
  background: #222;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
.btn.ghost {
  background: #fff;
  color: #333;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  margin: 10px 0 8px;
}

.grid-wrap {
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  overflow: hidden;
}

/* 인쇄 시 상단 툴바 감춤 (추후 PDF 인쇄 쓸 때 유용) */
@media print {
  .toolbar {
    display: none;
  }
}
</style>
