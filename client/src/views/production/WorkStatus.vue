<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />
  <UiParentCard>
    <v-card variant="outlined">
      <v-card-title>작업 진행 현황</v-card-title>
      <v-data-table :headers="headers" :items="rows" item-key="key" density="compact" :items-per-page="10">
        <template v-slot:[`item.progress`]="{ item }">
          <div class="bar">
            <v-progress-linear :model-value="item.progress" height="10" :color="item.progress >= 100 ? 'success' : 'primary'" />
            <span class="pct">{{ item.progress }}%</span>
          </div>
        </template>

        <template v-slot:[`item.state`]="{ item }">
          <v-chip size="small" :color="stateColor(item.state)" variant="tonal">
            {{ stateKorean(item.state) }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>
  </UiParentCard>
</template>

<script setup>
import { computed } from 'vue';
import { useProcessSimStore } from '@/stores/useProcessSimStore';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const store = useProcessSimStore();

const page = { title: '작업 진행 현황' };
const breadcrumbs = [
  { title: '생산', disabled: true, href: '#' },
  { title: '작업 진행 현황', disabled: false, href: '#' }
];

const headers = [
  { title: '공정순서', value: 'orderIdx', width: 90 },
  { title: '공정명', value: 'processName', width: 120 },
  { title: '지시번호', value: 'issueNumber' },
  { title: '제품명', value: 'productName' },
  { title: '상태', value: 'state', width: 110 },
  { title: '진행률', value: 'progress', sortable: false, width: 220 },
  { title: '지시량', value: 'targetQty', width: 80 },
  { title: '기생산', value: 'producedQty', width: 80 },
  { title: '미생산', value: 'remainingQty', width: 80 }
];

function orderIdxOf(proc) {
  const map = { CUT: 1, FAB: 2, POL: 3, PAI: 4, ASM: 5 };
  return map[proc] || 9;
}

const rows = computed(() =>
  store.flatRowsForStatus
    .map((r) => ({
      key: `${r.orderId}-${r.process}`,
      orderIdx: orderIdxOf(r.process),
      processName: r.processName,
      issueNumber: r.issueNumber,
      productName: r.productName,
      state: r.state, // RUN / PAUSE / DONE / WAIT
      progress: r.progress,
      targetQty: r.targetQty,
      producedQty: r.producedQty,
      remainingQty: r.remainingQty
    }))
    .sort((a, b) => a.orderIdx - b.orderIdx)
);

function stateKorean(s) {
  if (s === 'RUN') return '진행중';
  if (s === 'PAUSE') return '일시정지';
  if (s === 'DONE') return '완료';
  return '대기';
}
function stateColor(s) {
  return s === 'RUN' ? 'primary' : s === 'DONE' ? 'success' : s === 'PAUSE' ? 'warning' : 'grey';
}
</script>

<style scoped>
.bar {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pct {
  min-width: 38px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
