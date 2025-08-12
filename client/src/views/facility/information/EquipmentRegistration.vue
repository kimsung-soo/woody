<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>

  <UiParentCard title="설비 정보 등록">
    <v-row class="mb-4">
      <v-col cols="6">
        <v-text-field label="설비코드" v-model="form.code" dense outlined />
      </v-col>
      <v-col cols="6">
        <v-text-field label="설비명" v-model="form.name" dense outlined />
      </v-col>
      <v-col cols="12">
        <v-text-field label="설비유형" v-model="form.type" dense outlined />
      </v-col>
      <v-col cols="6">
        <v-label class="mb-2 d-block">사용유무</v-label>
        <v-radio-group v-model="form.useYn" inline>
          <v-radio label="사용" value="사용" />
          <v-radio label="미사용" value="미사용" />
        </v-radio-group>
      </v-col>

      <v-col cols="12">
        <v-text-field label="제조사" v-model="form.maker" dense outlined />
      </v-col>
      <v-col cols="6">
        <v-text-field label="설비 제조일" v-model="form.makeDate" type="date" dense outlined />
      </v-col>
      <v-col cols="6">
        <v-text-field label="설비 설치일" v-model="form.installDate" type="date" dense outlined />
      </v-col>
      <v-col cols="6">
        <v-text-field label="점검 주기(일)" v-model.number="form.checkCycle" type="number" dense outlined />
      </v-col>
      <v-col cols="6">
        <v-text-field label="담당자" v-model="form.manager" dense outlined />
      </v-col>
    </v-row>

    <v-row justify="end">
      <v-btn color="primary" class="mr-2" @click="sign">등록</v-btn>
    </v-row>
  </UiParentCard>
</template>

<script setup>
import { ref, shallowRef, reactive } from 'vue';
import axios from 'axios';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const page = ref({ title: '설비 정보 관리' });
const breadcrumbs = shallowRef([
  { title: '설비', disabled: true, href: '#' },
  { title: '설비 정보 등록', disabled: false, href: '#' }
]);

const form = reactive({
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
    const res = await axios.post('/api/form', form);
    if (res.data.result) {
      alert('설비 등록 완료!');
    }
  } catch (err) {
    console.error(err);
    alert('등록 실패');
  }
};
</script>
