// import {
//   CircleIcon,
//   WindmillIcon,
//   TypographyIcon,
//   ShadowIcon,
//   PaletteIcon,
//   KeyIcon,
//   BugIcon,
//   DashboardIcon,
//   BrandChromeIcon,
//   HelpIcon
// } from 'vue-tabler-icons';

export interface menu {
  header?: string;
  title?: string;
  icon?: object;
  to?: string;
  divider?: boolean;
  chip?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
}

const sidebarItem: menu[] = [
  {
    title: '기준정보',
    children: [
      {
        title: '사원 관리',
        to: '/dashboard/default'
      },
      {
        title: '제품 관리',
        to: '/dashboard/default'
      },
      {
        title: '자재 관리',
        to: '/dashboard/default'
      },
      {
        title: '재공품 관리',
        to: '/dashboard/default'
      },
      {
        title: '공정 관리',
        to: '/dashboard/default'
      },
      {
        title: '공정흐름도 관리',
        to: '/dashboard/default'
      },
      {
        title: 'BOM 관리',
        to: '/dashboard/default'
      }
    ]
  },
  {
    title: '영업',
    children: [
      {
        title: '거래처',
        children: [
          {
            title: '거래처 등록',
            to: '/dashboard/default'
          },
          {
            title: '거래처 조회',
            to: '/dashboard/default'
          }
        ]
      },
      {
        title: '주문서',
        children: [
          {
            title: '주문서 등록',
            to: '/dashboard/default'
          },
          {
            title: '주문서 조회',
            to: '/dashboard/default'
          }
        ]
      },
      {
        title: '생산 의뢰서',
        children: [
          {
            title: '생산 의뢰서 등록',
            to: '/dashboard/default'
          },
          {
            title: '거래처 조회',
            to: '/dashboard/default'
          }
        ]
      },
      {
        title: '제품 입출고',
        children: [
          {
            title: '입고 및 LOT 생성',
            to: '/dashboard/default'
          },
          {
            title: '출하지시서 등록',
            to: '/dashboard/default'
          },
          {
            title: '출하지시서 조회',
            to: '/dashboard/default'
          }
        ]
      }
    ]
  },
  {
    title: '자재',
    children: [
      {
        title: '자재발주서',
        children: [
          {
            title: '자재발주서 등록',
            to: '/dashboard/default'
          },
          {
            title: '자재발주서 조회',
            to: '/dashboard/default'
          }
        ]
      },
      {
        title: '입고',
        children: [
          {
            title: '입고 등록',
            to: '/dashboard/default'
          },
          {
            title: '입고 조회',
            to: '/dashboard/default'
          }
        ]
      },
      {
        title: '불량품',
        children: [
          {
            title: '불량품 조회',
            to: '/dashboard/default'
          },
          {
            title: '자재반품요청서 등록',
            to: '/dashboard/default'
          },
          {
            title: '자재반품요청서 조회',
            to: '/dashboard/default'
          }
        ]
      },
      {
        title: '재고',
        children: [
          {
            title: '자재 LOT 등록',
            to: '/dashboard/default'
          },
          {
            title: '재공품 등록',
            to: '/dashboard/default'
          },
          {
            title: '재고 수량 조회',
            to: '/dashboard/default'
          },
          {
            title: '재고 입출고 조회',
            to: '/dashboard/default'
          }
        ]
      }
    ]
  },
  {
    title: '생산',
    children: [
      {
        title: '생산계획',
        children: [
          {
            title: '계획관리',
            to: '/dashboard/default'
          },
          {
            title: '계획조회',
            to: '/dashboard/default'
          },
          {
            title: '계획 수정/삭제',
            to: '/dashboard/default'
          }
        ]
      },
      {
        title: '작업지시',
        children: [
          {
            title: '작업지시 관리',
            to: '/dashboard/default'
          },
          {
            title: '작업지시 조회',
            to: '/dashboard/default'
          },
          {
            title: '작업지시 수정/삭제',
            to: '/dashboard/default'
          }
        ]
      },
      {
        title: '공정관리',
        children: [
          {
            title: '공정 진행 관리',
            to: '/dashboard/default'
          },
          {
            title: '작업 진행 현황',
            to: '/dashboard/default'
          },
          {
            title: '생산 실적 조회',
            to: '/dashboard/default'
          }
        ]
      }
    ]
  },
  {
    title: '설비',
    children: [
      {
        title: '설비 정보 관리',
        children: [
          {
            title: '전체 조회',
            to: '/dashboard/default'
          },
          {
            title: '설비 등록',
            to: '/dashboard/default'
          },
          {
            title: '설비 수정',
            to: '/dashboard/default'
          }
        ]
      },
      {
        title: '설비 상태 관리',
        children: [
          {
            title: '전체 조회',
            to: '/dashboard/default'
          },
          {
            title: '가동/비가동 관리',
            to: '/dashboard/default'
          }
        ]
      },
      {
        title: '설비 수리 관리',
        children: [
          {
            title: '수리 관리',
            to: '/dashboard/default'
          },
          {
            title: '수리 내역',
            to: '/dashboard/default'
          }
        ]
      },
      {
        title: '설비 점검 관리',
        children: [
          {
            title: '점검 관리',
            to: '/dashboard/default'
          },
          {
            title: '점검 내역',
            to: '/dashboard/default'
          }
        ]
      }
    ]
  },
  {
    title: '품질',
    children: [
      {
        title: '원자재',
        children: [
          {
            title: '원자재 검수 조회',
            to: '/dashboard/default'
          },
          {
            title: '원자재 검수서 관리',
            to: '/dashboard/default'
          }
        ]
      },
      {
        title: '제품성적서',
        children: [
          {
            title: '조회',
            to: '/dashboard/default'
          },
          {
            title: '관리',
            to: '/dashboard/default'
          }
        ]
      },
      {
        title: '품질 기준',
        children: [
          {
            title: '조회',
            to: '/dashboard/default'
          },
          {
            title: '관리',
            to: '/dashboard/default'
          }
        ]
      }
    ]
  },
  {
    title: '물류',
    children: [
      {
        title: '창고관리',
        to: '/dashboard/default'
      },
      {
        title: '물류 출하',
        to: '/dashboard/default'
      },
      {
        title: '폐기 처리',
        to: '/dashboard/default'
      }
    ]
  }
];

export default sidebarItem;
