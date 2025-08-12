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
    {
      name: 'MasterDiagram',
      path: '/master/MasterDiagram',
      component: () => import('@/views/master/MasterDiagram.vue')
    },
    {
      name: 'MasterEMP',
      path: '/master/MasterEmp',
      component: () => import('@/views/master/MasterEmp.vue')
    },
    // 영업
    {
      name: 'OrderForm',
      path: '/marketing/OrderForm',
      component: () => import('@/views/marketing/OrderForm.vue')
    },
    {
      name: 'OrderFormList',
      path: '/marketing/OrderFormList',
      component: () => import('@/views/marketing/OrderFormList.vue')
    },
     {
      name: 'MfOrderForm',
      path: '/marketing/MfOrderForm',
      component: () => import('@/views/marketing/MfOrderForm.vue')
    },
     {
      name: 'MfOrderFormList',
      path: '/marketing/MfOrderFormList',
      component: () => import('@/views/marketing/MfOrderFormList.vue')
    },
     {
      name: 'MkInbound',
      path: '/marketing/MkInbound',
      component: () => import('@/views/marketing/MkInbound.vue')
    },
     {
      name: 'MkOutbound',
      path: '/marketing/MkOutbound',
      component: () => import('@/views/marketing/MkOutbound.vue')
    },
    {
      name: 'MkLotList',
      path: '/marketing/MkLotList',
      component: () => import('@/views/marketing/MkLotList.vue')
    },
    {
      name: 'MkOutboundForm',
      path: '/marketing/MkOutboundForm',
      component: () => import('@/views/marketing/MkOutboundForm.vue')
    },
    {
      name: 'MkOutboundFormList',
      path: '/marketing/MkOutboundFormList',
      component: () => import('@/views/marketing/MkOutboundFormList.vue')
    },
    {
      name: 'MkAccount',
      path: '/marketing/MkAccount',
      component: () => import('@/views/marketing/MkAccount.vue')
    },
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
    {
      name: 'MaterialInsert',
      path: '/material/insert',
      component: () => import('@/views/Materials/MaterialInsert.vue')
    },
    {
      name: 'MaterialSelect',
      path: '/material/select',
      component: () => import('@/views/Materials/MaterialSelect.vue')
    },
    {
      name: 'FailMaterialSelect',
      path: '/failMaterial/select',
      component: () => import('@/views/Materials/FailMaterialSelect.vue')
    },
    {
      name: 'MaterialEquest',
      path: '/failMaterial/equest',
      component: () => import('@/views/Materials/MaterialEquest.vue')
    },
    {
      name: 'MaterialEquestSelect',
      path: '/failMaterial/equest/select',
      component: () => import('@/views/Materials/MaterialEqusetSelect.vue')
    },
    {
      name: 'InsertLOT',
      path: '/material/LOT',
      component: () => import('@/views/Materials/InsertLOT.vue')
    },
    {
      name: 'InsertRetrial',
      path: '/material/retrial',
      component: () => import('@/views/Materials/RetrialInsert.vue')
    },
    {
      name: 'StockSelect',
      path: '/stock',
      component: () => import('@/views/Materials/StockSelect.vue')
    },
    {
      name: 'StockStatus',
      path: '/stock/status',
      component: () => import('@/views/Materials/StockStatus.vue')
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
    {
      name: 'OrderCheck',
      path: '/production/ordercheck',
      component: () => import('@/views/production/OrderCheck.vue')
    },
    {
      name: 'OrderModify',
      path: '/production/ordermodify',
      component: () => import('@/views/production/OrderModify.vue')
    },
    {
      name: 'ProcessManagement',
      path: '/production/processcontrol',
      component: () => import('@/views/production/ProcessControl.vue')
    },
    // 설비
    {
      name: 'Registration',
      path: '/utils/Registration',
      component: () => import('@/views/facility/information/EquipmentRegistration.vue')
    },
    {
      name: 'CheckManagement',
      path: '/utils/CheckManagement',
      component: () => import('@/views/facility/check/CheckManagement.vue')
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
    {
      name: 'RepairManagement',
      path: '/utils/RepairManagement',
      component: () => import('@/views/facility/repair/RepairManagement.vue')
    },

    // 품질
    {
      name: 'Quality',
      path: '/qm/matlst',
      component: () => import('../views/quality/material/MaterialList.vue')
    },
    {
      name: 'QualityMatManagement',
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
