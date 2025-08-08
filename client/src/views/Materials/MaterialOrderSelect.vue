<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <UiParentCard title="자재발주서 검색조건">
    <v-row class="mb-4">
      <v-col cols="3">
        <v-text-field label="발행번호" v-model="issueNumber" placeholder="발행번호" dense outlined readonly>
          <i class="fa-solid fa-magnifying-glass fa-xl icons" @click="'모달창'"></i>
        </v-text-field>
      </v-col>
      <v-col cols="3">
        <v-text-field label="자재명" v-model="materialName" placeholder="자재명" dense outlined readonly>
          <i class="fa-solid fa-magnifying-glass fa-xl icons" @click="'모달창'"></i>
        </v-text-field>
      </v-col>
      <v-col cols="3">
        <v-text-field label="자재코드" v-model="materialCode" placeholder="자재코드" dense outlined readonly>
          <i class="fa-solid fa-magnifying-glass fa-xl icons" @click="'모달창'"></i>
        </v-text-field>
      </v-col>
      <v-col cols="3">
        <v-text-field label="담당자" v-model="issueNumber" placeholder="담당자" dense outlined />
      </v-col>
      <v-col cols="3">
        <v-text-field label="발주일자" v-model="orderDate" type="date" dense outlined />
      </v-col>
      <v-col cols="3">
        <v-text-field label="납기일자" v-model="dueDate" type="date" dense outlined />
      </v-col>
      <v-col cols="6">
        <div class="radioDiv">
          <span class="mr-2">상태:</span>
          <v-radio-group v-model="status" inline hide-details>
            <v-radio label="대기" value="대기" />
            <v-radio label="진행중" value="진행중" />
            <v-radio label="완료" value="완료" />
          </v-radio-group>
        </div>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-btn color="error" class="mr-2" @click="inputReset">초기화</v-btn>
      <v-btn color="darkText" @click="fileSelect">검색</v-btn>
    </v-row>
  </UiParentCard>
  <div class="div"></div>
  <UiParentCard title="자재발주서 목록">
    <v-table class="md-4" density="default">
      <thead>
        <tr>
          <th>발행번호</th>
          <th>공급업체</th>
          <th>자재명</th>
          <th>자재코드</th>
          <th>규격</th>
          <th>단위</th>
          <th>금액</th>
          <th>발주일자</th>
          <th>납기일자</th>
          <th>담당자</th>
          <th>수량</th>
          <th>상태</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(order, index) in orders" :key="index">
          <td>{{ order.issueNumber }}</td>
          <td>{{ order.vendor }}</td>
          <td>{{ order.materialName }}</td>
          <td>{{ order.materialCode }}</td>
          <td>{{ order.spec }}</td>
          <td>{{ order.unit }}</td>
          <td>{{ order.amount }}</td>
          <td>{{ order.orderDate }}</td>
          <td>{{ order.dueDate }}</td>
          <td>{{ order.manager }}</td>
          <td>{{ order.quantity }}</td>
          <td :class="getStatusClass(order.status)">{{ order.status }}</td>
        </tr>
      </tbody>
    </v-table>
  </UiParentCard>
</template>

<script setup lang="ts">
import { ref, shallowRef } from 'vue';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const page = ref({ title: '자재발주서' });
const breadcrumbs = shallowRef([
  {
    title: '자재',
    disabled: true,
    href: '#'
  },
  {
    title: '자재발주서 조회',
    disabled: false,
    href: '#'
  }
]);

const issueNumber = ref('');
const materialName = ref('');
const materialCode = ref('');
const orderDate = ref('');
const dueDate = ref('');
const status = ref('');

function inputReset() {
  alert('초기화하는 버튼');
}

function fileSelect() {
  alert('검색하는 버튼');
}

// 더미데이터
const orders = [
  {
    issueNumber: 'ORD-20250808-001',
    vendor: '한빛상사',
    materialName: '철근',
    materialCode: 'MTL-00123',
    spec: 'SD400 D10',
    unit: '톤',
    amount: '₩1,200,000',
    orderDate: '2025-08-08',
    dueDate: '2025-08-15',
    manager: '이동섭',
    quantity: 10,
    status: '대기'
  },
  {
    issueNumber: 'ORD-20250808-002',
    vendor: '삼성자재',
    materialName: '콘크리트',
    materialCode: 'MTL-00124',
    spec: '25-210-18',
    unit: '㎥',
    amount: '₩3,500,000',
    orderDate: '2025-08-08',
    dueDate: '2025-08-16',
    manager: '최은수',
    quantity: 20,
    status: '진행중'
  }
];

function getStatusClass(status: string) {
  switch (status) {
    case '대기':
      return 'status-wait';
    case '진행중':
      return 'status-progress';
    case '완료':
      return 'status-done';
    default:
      return '';
  }
}
</script>

<style scoped>
.icons {
  margin-left: 19rem;
  margin-bottom: 1rem;
}

.icons:hover {
  cursor: pointer;
}

.radioDiv {
  margin-left: 1rem;
}

.div {
  padding: 0.5rem;
}
</style>
