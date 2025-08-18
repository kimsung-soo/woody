const mariadb = require("../database/mapper.js");

// =======================
// 내부 유틸: FAC_ID 생성 (FAC-001 형식, 동시성 보호)
// =======================
async function getNextFacId() {
  // 1) 잠금 획득 (최대 2초 대기)
  await mariadb.query("facIdLock");
  try {
    // 2) 현재 최대 번호 조회
    const rows = await mariadb.query("facIdMaxNo");
    const maxNo = (rows?.[0]?.max_no || 0) + 1;
    const facId = `FAC-${String(maxNo).padStart(3, "0")}`;
    return facId;
  } finally {
    // 3) 잠금 해제
    await mariadb.query("facIdUnlock");
  }
}

// =======================
// FACILITY (기본)
// =======================
const facilitySelect = async () => mariadb.query("facilitySelect");

const facilityById = async (data) =>
  mariadb.query("facilityById", [data.FAC_ID]);

const facilityInsert = async (data) => {
  // FAC_ID 없으면 자동 발급
  const FAC_ID = data.FAC_ID || (await getNextFacId());

  // !!! 중요: sqls/facility.js 의 facilityInsert 의 ? 순서와 1:1 매칭 !!!
  const params = [
    FAC_ID, // 1) FAC_ID
    data.FAC_NAME, // 2
    data.FAC_TYPE, // 3
    data.FAC_USE ?? 1, // 4
    data.FAC_COMPANY ?? null, // 5
    data.FAC_MDATE ?? null, // 6
    data.FAC_IDATE ?? null, // 7
    data.FAC_CHECKDAY ?? null, // 8
    data.FAC_TYPE, // 9) PR_ID 서브쿼리 조건 #1
    data.FAC_TYPE, // 10) PR_ID 서브쿼리 조건 #2(코드→이름 매핑)
    data.MANAGER ?? null, // 11
  ];

  const rs = await mariadb.query("facilityInsert", params);
  // 프런트에서 방금 생성된 FAC_ID를 쓰고 싶을 수 있으니 함께 반환
  return { ...rs, FAC_ID };
};

const getNextFacilityId = async () => {
  // 미리보기 용(잠금 없이 추정값 보여주고, 저장 시엔 getNextFacId()로 확정)
  const rows = await mariadb.query("facIdMaxNo");
  const nextNo = (rows?.[0]?.max_no || 0) + 1;
  const facId = `FAC-${String(nextNo).padStart(3, "0")}`;
  return [{ FAC_ID: facId }];
};

const facilityUpdate = async (data) => {
  const params = [
    data.FAC_NAME,
    data.FAC_TYPE,
    data.FAC_USE,
    data.FAC_COMPANY,
    data.FAC_MDATE ?? null,
    data.FAC_IDATE ?? null,
    data.FAC_CHECKDAY ?? null,
    // PR_ID 서브쿼리 조건
    data.FAC_TYPE,
    data.FAC_TYPE,
    data.MANAGER ?? null,
    data.FAC_ID,
  ];
  return mariadb.query("facilityUpdate", params);
};

const processList = async () => mariadb.query("processList");

const facilityDelete = async (data) =>
  mariadb.query("facilityDelete", [data.FAC_ID]);

/** 공통코드: 그룹코드별 조회 */
const getCodesByGroup = async (groupCode) =>
  mariadb.query("codeByGroup", [groupCode]);

// =======================
// FACILITY_STATUS (상태)
// =======================
const facilityStatusList = async () => mariadb.query("facilityStatusList");

const facilityStatusCurrentByFac = async (facId) =>
  mariadb.query("facilityStatusCurrentByFac", [facId]);

// 가동 → 비가동 전환(UPDATE만)
const facilityStatusUpdateToDown = async (data) => {
  const params = [
    data.FS_STATUS, // 1
    data.FS_REASON ?? null, // 2
    data.FS_TYPE ?? null, // 3
    data.DOWN_STARTDAY ?? null, // 4
    data.FS_CHECKDAY ?? null, // 5
    data.FS_NEXTDAY ?? null, // 6
    data.MANAGER ?? null, // 7
    data.FS_ID, // 8 대상 행
  ];
  return mariadb.query("facilityStatusUpdateToDown", params);
};

// 비가동 종료(END_TIME + 복귀)
const facilityStatusEndDowntime = async ({
  FS_ID,
  endTime,
  restoreStatus = 0,
  checkTime = null,
  MANAGER = null,
}) =>
  mariadb.query("facilityStatusEndDowntime", [
    endTime,
    restoreStatus,
    checkTime,
    MANAGER,
    FS_ID,
  ]);

// =======================
// REPAIR (수리내역)
// =======================
const facilityRepairList = async () => mariadb.query("facilityRepairList");

const facilityRepairByFacId = async (facId) =>
  mariadb.query("facilityRepairByFacId", [facId]);

// 상태(FS_ID) 기준 수리내역 INSERT (content 필수)
const facilityRepairInsertFromStatus = async ({ fsId, content, note }) => {
  const params = [content, note ?? null, fsId];
  return mariadb.query("facilityRepairInsertFromStatus", params);
};

// 수리관리 오픈 목록: '고장'으로 비가동 중인 상태만
const facilityOpenRepairs = async () => mariadb.query("facilityOpenRepairs");

// =======================
// 필터
// =======================
const facilityStatusFilter = async ({
  facId = null,
  startDate = null,
  endDate = null,
}) =>
  // SQL의 플레이스홀더 순서와 동일하게 매핑
  mariadb.query("facilityStatusFilter", [
    facId, // ( ? IS NULL OR fs.FAC_ID = ? ) 1
    facId, // 2
    startDate, // ( ? IS NULL OR DATE(fs.DOWN_STARTDAY) >= DATE(?) ) 3
    startDate, // 4
    endDate, // ( ? IS NULL OR DATE(fs.DOWN_STARTDAY) <= DATE(?) ) 5
    endDate, // 6
  ]);

module.exports = {
  facilitySelect,
  facilityById,
  facilityInsert,
  getNextFacilityId,
  facilityUpdate,
  facilityDelete,
  getCodesByGroup,
  facilityStatusList,
  facilityStatusCurrentByFac,
  facilityStatusUpdateToDown,
  facilityStatusEndDowntime,
  facilityStatusFilter,
  facilityRepairList,
  facilityRepairByFacId,
  facilityRepairInsertFromStatus,
  facilityOpenRepairs,
  processList,
};
