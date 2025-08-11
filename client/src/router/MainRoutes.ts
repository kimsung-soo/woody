const MainRoutes = {
  path: '/main',
  meta: {
    requiresAuth: true
  },
  redirect: '/main/dashboard/default',
  component: () => import('@/layouts/full/FullLayout.vue'),
  children: [
    {
      name: 'LandingPage',
      path: '/',
      component: () => import('@/views/dashboards/default/DefaultDashboard.vue')
    },
    {
      name: 'Default',
      path: '/dashboard/default',
      component: () => import('@/views/dashboards/default/DefaultDashboard.vue')
    },
    {
      name: 'Starter',
      path: '/starter',
      component: () => import('@/views/StarterPage.vue')
    },
    {
      name: 'Tabler Icons',
      path: '/icons/tabler',
      component: () => import('@/views/utilities/icons/TablerIcons.vue')
    },
    {
      name: 'Material Icons',
      path: '/icons/material',
      component: () => import('@/views/utilities/icons/MaterialIcons.vue')
    },
    {
      name: 'Typography',
      path: '/utils/typography',
      component: () => import('@/views/utilities/typography/TypographyPage.vue')
    },
    {
      name: 'Shadows',
      path: '/utils/shadows',
      component: () => import('@/views/utilities/shadows/ShadowPage.vue')
    },
    {
      name: 'Colors',
      path: '/utils/colors',
      component: () => import('@/views/utilities/colors/ColorPage.vue')
    },
    {
      name: 'Modal',
      path: '/modal',
      component: () => import('@/views/common/MoDal.vue')
    },
    // 페이지 생성 후 여기 아래 라우터 생성.
    // 기준정보
    {
      name: 'MasterBom',
      path: '/master/MasterBom',
      component: () => import('@/views/master/MasterBom.vue')
    },
    // 영업

    // 자재
    {
      name: 'MaterialOrderInsert',
      path: '/material/order',
      component: () => import('@/views/Materials/MaterialOrderInsert.vue')
    },
    {
      name: 'MaterialOrderSelect',
      path: '/material/order/Select',
      component: () => import('@/views/Materials/MaterialOrderSelect.vue')
    },

    // 생산
    {
      name: 'ProductionPlan',
      path: '/production/plan',
      component: () => import('@/views/production/ProductionPlan.vue')
    },

    {
      name: 'WorkOrder',
      path: '/production/workorder',
      component: () => import('@/views/production/WorkOrder.vue')
    },
    // 설비
    {
      name: 'Registration',
      path: '/utils/Registration',
      component: () => import('@/views/facility/information/EquipmentRegistration.vue')
    },

    {
      name: 'List',
      path: '/utils/List',
      component: () => import('@/views/facility/information/EquipmentList.vue')
    },

    {
      name: 'status',
      path: '/utils/status',
      component: () => import('@/views/facility/state/EquipmentStatusList.vue')
    },
    {
      name: 'modify',
      path: '/utils/modify',
      component: () => import('@/views/facility/information/EquipmentModify.vue')
    },
    {
      name: 'repairhistory',
      path: '/utils/repairhistory',
      component: () => import('@/views/facility/repair/RepairHistory.vue')
    },
    {
      name: 'checkhistory',
      path: '/utils/checkhistory',
      component: () => import('@/views/facility/check/CheckHistory.vue')
    },

    // 품질
    {
      name: 'Quality',
      path: '/qm/matlst',
      component: () => import('../views/quality/material/MaterialList.vue')
    },
    {
      name: 'Quality',
      path: '/qm/matmng',
      component: () => import('../views/quality/material/MaterialManagement.vue')
    },
    {
      name: 'Quality',
      path: '/qm/prdlst',
      component: () => import('@/views/quality/product/ProductList.vue')
    }
    // 물류
  ]
};

export default MainRoutes;
