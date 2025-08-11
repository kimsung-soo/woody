<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>

  <UiParentCard title="설비 정보 등록">
    <v-row class="mb-4">
      <v-col cols="12">
        <!-- 각 필드는 equipment의 속성과 v-model로 양방향 바인딩 "입력창과 변수 값이 서로 실시간으로 반영되는 연결 -->
        <v-text-field label="설비코드" v-model="equipment.code" dense outlined />
      </v-col>
      <v-col cols="12">
        <v-text-field label="설비명" v-model="equipment.name" dense outlined />
      </v-col>
      <v-col cols="12">
        <v-text-field label="설비유형" v-model="equipment.type" dense outlined />
      </v-col>
      <v-col cols="12">
        <v-label class="mb-2 d-block">사용유무</v-label>
        <v-radio-group v-model="equipment.useYn" inline>
          <v-radio label="사용" value="사용" />
          <v-radio label="미사용" value="미사용" />
        </v-radio-group>
      </v-col>

      <v-col cols="12">
        <v-text-field label="제조사" v-model="equipment.maker" dense outlined />
      </v-col>
      <v-col cols="12">
        <v-text-field label="설비 제조일" v-model="equipment.makeDate" type="date" dense outlined />
      </v-col>
      <v-col cols="12">
        <v-text-field label="설비 설치일" v-model="equipment.installDate" type="date" dense outlined />
      </v-col>
      <v-col cols="12">
        <v-text-field label="점검 주기(일)" v-model.number="equipment.checkCycle" type="number" dense outlined />
      </v-col>
      <v-col cols="12">
        <v-text-field label="담당자" v-model="equipment.manager" dense outlined />
      </v-col>
    </v-row>

    <v-row justify="end">
      <v-btn color="primary" class="mr-2" @click="sign">등록</v-btn>
    </v-row>
  </UiParentCard>
</template>

<script setup lang="ts">
import { ref, shallowRef, reactive } from 'vue';
import axios from 'axios';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const page = ref({ title: '설비 정보 관리' });
const breadcrumbs = shallowRef([
  {
    title: '설비',
    disabled: true,
    href: '#'
  },
  {
    title: '설비 정보 등록',
    disabled: false,
    href: '#'
  }
]);

const equipment = reactive({
  code: '',
  name: '',
  type: '',
  useYn: '사용',
  maker: '',
  makeDate: '',
  installDate: '',
  checkCycle: '',
  manager: ''
});

const sign = async () => {
  try {
    const res = await axios.post('/api/equipment', equipment);
    if (res.data.result) {
      alert('설비 등록 완료!');
    }
  } catch (err) {
    console.error(err);
    alert('등록 실패');
  }
};
</script>
