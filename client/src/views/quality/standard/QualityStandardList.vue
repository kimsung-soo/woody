<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard>
    <!-- 상단 툴바 -->
    <div class="toolbar">
      <div class="filters">
        <v-row>
          <v-col cols="3">
            <v-text-field label="기준" @keyup.enter="onSearch" dense outlined />
          </v-col>
          <v-col cols="3">
            <v-select v-model="search.type" :items="['완제품', '반제품', '원목', '합판']" label="제품 구분" density="compact" />
          </v-col>
          <v-col cols="3">
            <v-btn class="ml-2" color="darkText" @click="onSearch">검색</v-btn>
            <v-btn class="ml-2" @click="onReset">초기화</v-btn>
          </v-col>
        </v-row>
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
import axios from 'axios';
import { ref, shallowRef, watch, onMounted } from 'vue';
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

// 데이터 구분

// 컬럼
const colDefs = ref([
  { headerName: '기준', field: 'stdName', flex: 1 },
  { headerName: '검사내용', field: 'stdContent', flex: 1 },
  { headerName: '허용수치', field: 'allowedValue', flex: 1 }
]);

const qcStdRowData = ref([]);

// 타입별 더미데이터
// const defaultData = ref({
//   완제품: [
//     { 기준: '함수율', 검사내용: '수분 함량 검사', 허용수치: '수분 함량이 12 ~ 13% 이하' },
//     { 기준: '치수정밀도', 검사내용: '전체 외형치수, 가공 및 조립 후 치수', 허용수치: '입고자재에서 ± 2mm 이내' },
//     { 기준: '강도/내구성', 검사내용: '하중, 휨, 낙하, 반복 사용시험(횡강도, 압축)', 허용수치: '횡강도 35MPa 이상' },
//     {
//       기준: '안정성',
//       검사내용: '전도방지, 전기부 위험, 모서리 안전성 시험',
//       허용수치: '전도 없음, 전기부 안전, 모서리 둥글림 위험요소 없음'
//     },
//     { 기준: '외관 결정', 검사내용: '옹이, 훼절, 균열 등 외관', 허용수치: '옹이, 훼절, 균열 유약확인 시 결점이 없을 시' },
//     { 기준: '포름알데히드 방출량', 검사내용: '완제품/반제품 목재의 포름알데히드 방출 시험', 허용수치: '친환경 E0 등급(0.3mg/L)이하' },
//     { 기준: '표면 마감/도장', 검사내용: '도막 균일성, 접착력, 내마모성 검사', 허용수치: '도막 들뜸·박리 없음, 균일한 색상·광택 유지' }
//   ],
//   반제품: [
//     { 기준: '함수율', 검사내용: '수분 함량 검사', 허용수치: '수분 함량이 12 ~ 13% 이하' },
//     { 기준: '치수정밀도', 검사내용: '전체 외형치수, 가공 및 조립 후 치수', 허용수치: '입고자재에서 ± 2mm 이내' },
//     { 기준: '강도/내구성', 검사내용: '하중, 휨, 낙하, 반복 사용시험(횡강도, 압축)', 허용수치: '횡강도 35MPa 이상' },
//     {
//       기준: '안정성',
//       검사내용: '전도방지, 전기부 위험, 모서리 안전성 시험',
//       허용수치: '전도 없음, 전기부 안전, 모서리 둥글림 위험요소 없음'
//     },
//     { 기준: '외관 결정', 검사내용: '옹이, 훼절, 균열 등 외관', 허용수치: '옹이, 훼절, 균열 유약확인 시 결점이 없을 시' },
//     { 기준: '포름알데히드 방출량', 검사내용: '완제품/반제품 목재의 포름알데히드 방출 시험', 허용수치: '친환경 E0 등급(0.3mg/L)이하' },
//     { 기준: '표면 마감/도장', 검사내용: '도막 균일성, 접착력, 내마모성 검사', 허용수치: '도막 들뜸·박리 없음, 균일한 색상·광택 유지' }
//   ],
//   원목: [
//     { 기준: '함수율', 검사내용: '수분 함량 검사', 허용수치: '10 ~ 12% 이하' },
//     { 기준: '치수정밀도', 검사내용: '가공 치수 오차 측정', 허용수치: '± 1.5mm 이내' },
//     { 기준: '외관', 검사내용: '옹이/균열/뒤틀림', 허용수치: '구조적 강성 저하 없음' }
//   ],
//   합판: [
//     { 기준: '겉면 등급', 검사내용: '옹이, 패치, 크랙', 허용수치: '등급 기준 충족(BB/CC 등)' },
//     { 기준: '접착 강도', 검사내용: '박리 시험', 허용수치: '기준 이상' },
//     { 기준: '포름알데히드', 검사내용: '방출량 시험', 허용수치: 'E0 등급(0.3mg/L)이하' }
//   ]
// });

// db연결 후 데이터 가져오기
// const getQStandardList = async () => {
//   try {
//     const result = await axios.get('http://localhost:3000/qstdlist');
//     // DB 응답 데이터를 rowData에 매핑
//     if (result.data && result.data.length > 0) {
//       // DB 필드명을 Vue 컴포넌트에서 사용하는 필드명으로 매핑
//       qcStdRowData.value = result.data.map((item) => ({
//         기준: item.STD_NAME,
//         검사내용: item.STD_CONTENT,
//         허용수치: item.ALLOWED_VALUE
//       }));
//     }
//   } catch (err) {
//     console.error(err);
//   }
// };

// DB에서 데이터 가져오기
// const getQStandardList = async () => {
//   try {
//     const result = await axios.get(`http://localhost:3000/qstdlist`);
//     console.log('result.data는 => ' + result.data);
//     forEach() => result.data
//     if (result.data && result.data.length > 0) {
//       qcStdRowData.value = result.data.map((item) => ({
//         기준: item.STD_NAME,
//         검사내용: item.STD_CONTENT,
//         허용수치: item.ALLOWED_VALUE
//       }));
//     }
//   } catch (err) {
//     console.error(err);
//   }
// };

// db연결 후 데이터 가져오기
// const getQStandardList = async () => {
//   try {
//     const result = await axios.get('http://localhost:3000/qstdlist');
//     if (result.data && result.data.length > 0) {
//       result.data.forEach((item => {

//       })
//       qcStdRowData.value = result.data.map((item) => ({
//         기준: item.STD_NAME,
//         검사내용: item.STD_CONTENT,
//         허용수치: item.ALLOWED_VALUE
//       }));
//     }
//   } catch (err) {
//     console.error(err);
//   }
// };

// 검색 상태
const search = ref({
  keyword: '', // 기준(입력란)
  type: '구분' // 라디오 선택
});

// 타입 변경 감지 (watch 사용)
watch(
  () => search.value.type,
  async (newType) => {
    if (newType && newType !== '구분') {
      await getQStandardList(newType);
    }
  }
);

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

// 컴포넌트 마운트 시 초기 데이터 로드
onMounted(() => {
  getQStandardList(search.value.type);
});

// 버튼 액션
const onSearch = async () => {
  if (search.value.type && search.value.type !== '구분') {
    await getQStandardList(search.value.type);
  }
};
const onReset = () => {
  search.value.keyword = '';
  if (gridApi) gridApi.setGridOption('rowData', qcStdRowData.value);
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

/* .btn {
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
} */

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
