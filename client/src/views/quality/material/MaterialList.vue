<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>

  <UiParentCard title="원자재 검수 조회">
    <v-row class="mb-4">
      <v-col cols="6">
        <v-text-field label="원자재명" v-model="form.supplier" dense outlined />
      </v-col>
      <v-col cols="6">
        <v-text-field label="연락처" v-model="form.contact" dense outlined />
      </v-col>
      <v-col cols="6">
        <v-text-field label="발행번호" v-model="form.issueNumber" :readonly="true" placeholder="발행번호" dense outlined />
      </v-col>
      <v-col cols="6">
        <v-text-field label="발주일자" v-model="form.orderDate" type="date" dense outlined />
      </v-col>
      <v-col cols="6">
        <v-text-field label="납기일자" v-model="form.dueDate" type="date" dense outlined />
      </v-col>
    </v-row>
    <v-table class="mb-4" density="compact">
      <thead>
        <tr>
          <th>자재명</th>
          <th>자재코드</th>
          <th>수량</th>
          <th>규격</th>
          <th>단위</th>
          <th>단가</th>
          <th>금액</th>
          <th>비고</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in form.items" :key="index">
          <td><v-text-field readonly v-model="item.name" dense variant="plain" /></td>
          <td><v-text-field readonly v-model="item.code" dense variant="plain" /></td>
          <td><v-text-field v-model.number="item.qty" type="number" dense variant="plain" @input="onQtyInput(index)" /></td>
          <td><v-text-field readonly v-model="item.spec" dense variant="plain" /></td>
          <td><v-text-field readonly v-model="item.unit" dense variant="plain" /></td>
          <td><v-text-field readonly v-model.number="item.price" type="number" dense variant="plain" @input="calculateAmount(index)" /></td>
          <td><v-text-field :value="item.qty * item.price" readonly dense variant="plain" /></td>
          <td><v-text-field v-model="item.note" dense variant="plain" /></td>
        </tr>
      </tbody>
    </v-table>

    <!-- 총금액 / 담당자 -->
    <v-row class="mb-4">
      <v-col cols="6">
        <v-text-field label="총금액" :value="totalAmount" readonly outlined />
      </v-col>
      <v-col cols="6">
        <v-text-field label="담당자" v-model="form.manager" outlined />
      </v-col>
    </v-row>

    <!-- 버튼 -->
    <v-row justify="end">
      <v-btn color="error" class="mr-2" @click="resetForm">초기화</v-btn>
      <v-btn color="success" @click="submitForm">저장</v-btn>
    </v-row>
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
    title: '자재발주서 등록',
    disabled: false,
    href: '#'
  }
]);

import { reactive, computed } from 'vue';

interface Item {
  name: string;
  code: string;
  qty: number;
  spec: string;
  unit: string;
  price: number;
  note: string;
  amount?: number;
}

interface FormType {
  supplier: string;
  contact: string;
  issueNumber: string;
  orderDate: string;
  dueDate: string;
  manager: string;
  items: Item[];
}

const form = reactive<FormType>({
  supplier: '',
  contact: '',
  issueNumber: '',
  orderDate: '',
  dueDate: '',
  manager: '',
  items: [
    { name: '', code: '', qty: 0, spec: '', unit: '', price: 0, note: '', amount: 0 },
    { name: '', code: '', qty: 0, spec: '', unit: '', price: 0, note: '', amount: 0 },
    { name: '', code: '', qty: 0, spec: '', unit: '', price: 0, note: '', amount: 0 }
  ]
});

const totalAmount = computed(() => form.items.reduce((sum, item) => sum + item.qty * item.price, 0));

function calculateAmount(index: number): void {
  const item = form.items[index];
  item.amount = item.qty * item.price;
}

function onQtyInput(index: number) {
  const item = form.items[index];
  if (item.qty < 0) {
    item.qty = 0;
  }
  calculateAmount(index);
}

function resetForm(): void {
  form.supplier = '';
  form.contact = '';
  form.orderDate = '';
  form.dueDate = '';
  form.manager = '';
  form.items.forEach((item) => {
    Object.assign(item, {
      name: '',
      code: '',
      qty: 0,
      spec: '',
      unit: '',
      price: 0,
      note: '',
      amount: 0
    });
  });
}

function submitForm(): void {
  console.log('제출된 폼:', JSON.stringify(form, null, 2));
  alert('폼 제출 성공');
}
</script>
