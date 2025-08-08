<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>

  <UiParentCard title="설비 상태조회">
    <v-row align="start" class="mb-2">
      <v-col cols="12" md="6">
        <v-row class="mb-2">
          <v-col cols="6" class="d-flex justify-end">
            <v-text-field
              v-model.trim="productKeyword"
              placeholder="공정코드"
              hide-details
              density="compact"
              variant="outlined"
              style="max-width: 240px"
              @keyup.enter="searchProducts"
            />
            <v-btn class="ml-2" color="darkText" @click="searchProducts">검색</v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-table density="compact" class="mb-4">
      <thead>
        <tr>
          <th>설비코드</th>
          <th>설비명</th>
          <th>설비유형</th>
          <th>설비상태</th>
          <th>비가동사유</th>
          <th>점검완료일</th>
          <th>다음점검일</th>
          <th>담당자</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(item, index) in form.items" :key="index">
          <td><v-text-field v-model="item.code" dense variant="plain" /></td>
          <td><v-text-field v-model="item.name" dense variant="plain" /></td>
          <td><v-text-field v-model="item.type" dense variant="plain" /></td>
          <td>
            <v-text-field v-model="item.status" dense variant="plain" :style="{ color: item.status === '가동' ? 'blue' : 'red' }" />
          </td>
          <td><v-text-field v-model="item.not" dense variant="plain" /></td>
          <td><v-text-field v-model="item.done" dense variant="plain" /></td>
          <td><v-text-field v-model="item.next" dense variant="plain" /></td>
          <td><v-text-field v-model="item.manager" dense variant="plain" /></td>
        </tr>
      </tbody>
    </v-table>
  </UiParentCard>
</template>

<script setup>
import { ref, reactive, shallowRef } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const page = ref({ title: '설비 상태관리' });
const breadcrumbs = shallowRef([
  {
    title: '설비 상태',
    disabled: true,
    href: '#'
  },
  {
    title: '전체 조회',
    disabled: false,
    href: '#'
  }
]);

// 검색 입력/핸들러 추가
const productKeyword = ref('');
const searchProducts = () => {
  // TODO: 실제 검색 로직
  console.log('검색:', productKeyword.value);
};

const form = reactive({
  items: [
    {
      code: 'EQ-001',
      name: '띠톱기계',
      type: '재단공정',
      status: '비가동',
      not: '전기 이상',
      done: '2025-01-15 17:00:53',
      next: '2025-07-18',
      manager: '이동섭'
    },

    {
      code: 'EQ-001',
      name: '직각 왕복 판톱',
      type: '재단공정',
      status: '가동',
      not: '-',
      done: '2025-01-15 19:00:00',
      next: '2025-07-18',
      manager: '이동섭'
    }
  ]
});
</script>
