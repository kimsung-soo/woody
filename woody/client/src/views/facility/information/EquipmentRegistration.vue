<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

  <UiParentCard title="설비 정보 등록">
    <v-row class="mb-4">
      <v-col cols="6">
        <v-text-field label="설비코드" v-model.trim="form.code" dense outlined required />
      </v-col>

      <v-col cols="6">
        <v-text-field label="설비명" v-model.trim="form.name" dense outlined />
      </v-col>

      <v-col cols="6">
        <v-text-field label="설비유형" v-model.trim="form.type" dense outlined />
      </v-col>
      <v-col cols="6">
        <v-text-field label="제조사" v-model.trim="form.maker" dense outlined />
      </v-col>

      <v-col cols="12">
        <v-label class="mb-2 d-block">사용유무</v-label>
        <v-radio-group v-model="form.useYn" inline>
          <v-radio label="사용" value="사용" />
          <v-radio label="정지" value="정지" />
        </v-radio-group>
      </v-col>

      <v-col cols="6">
        <v-text-field label="설비 제조일" v-model="form.makeDate" type="date" dense outlined />
      </v-col>

      <v-col cols="6">
        <v-text-field label="설비 설치일" v-model="form.installDate" type="date" dense outlined />
      </v-col>

      <v-col cols="6">
        <v-text-field label="점검 주기(일)" v-model.number="form.checkCycle" type="number" min="0" dense outlined />
      </v-col>

      <v-col cols="6">
        <v-text-field label="담당자" v-model.trim="form.manager" dense outlined />
      </v-col>

      <v-col cols="">
        <v-text-field label="공정 코드" v-model.trim="form.prId" dense outlined />
      </v-col>
    </v-row>

    <v-row justify="end">
      <v-btn color="primary" @click="sign" :loading="loading" :disabled="loading || !canSubmit"> 등록 </v-btn>
    </v-row>
  </UiParentCard>
</template>

<script setup>
import { ref, shallowRef, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const router = useRouter();

const page = ref({ title: '설비 정보 관리' });
const breadcrumbs = shallowRef([
  { title: '설비', disabled: true, href: '#' },
  { title: '설비 정보 등록', disabled: false, href: '#' }
]);

const form = reactive({
  code: '',
  name: '',
  type: '',
  useYn: '사용', // '사용' | '미사용'
  maker: '',
  makeDate: '', // 'YYYY-MM-DD'
  installDate: '', // 'YYYY-MM-DD'
  checkCycle: '', // number | ''
  manager: '',
  prId: ''
});

const loading = ref(false);
const canSubmit = computed(() => !!form.code && !!form.prId);

const toNull = (v) => (v === '' || v === undefined ? null : v);
const toIntOrNull = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const sign = async () => {
  if (!canSubmit.value) {
    alert('설비코드와 공정코드를 입력하세요');
    return;
  }

  const payload = {
    FAC_ID: form.code,
    FAC_NAME: toNull(form.name),
    FAC_TYPE: toNull(form.type),
    FAC_USE: form.useYn === '사용' ? 1 : 0,
    FAC_COMPANY: toNull(form.maker),
    FAC_MDATE: toNull(form.makeDate),
    FAC_IDATE: toNull(form.installDate),
    FAC_CHECKDAY: toIntOrNull(form.checkCycle),
    PR_ID: form.prId,
    MANAGER: toNull(form.manager)
  };

  try {
    loading.value = true;

    const res = await axios.post('http://localhost:3000/facilityInsert', payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    const affected = res?.data?.affectedRows ?? 0;
    if (affected >= 1) {
      alert('설비 등록 완료!');
      await router.push('/facility');
      return;
    }
    alert('등록 실패');
  } catch (err) {
    console.error(err);
    const msg = err?.response?.data?.error || err?.message || '등록 실패';
    alert(msg);
  } finally {
    loading.value = false;
  }
};
</script>
