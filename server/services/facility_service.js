const mariadb = require("../database/mapper.js");

// 설비 목록
const facilitySelect = async () => {
  return await mariadb.query("facilitySelect");
};

// 설비 단건
const facilityById = async ({ FAC_ID }) => {
  return await mariadb.query("facilityById", [FAC_ID]);
};

// 다음 설비코드
const getNextFacilityId = async () => {
  const rows = await mariadb.query("nextFacilityId");
  return rows?.[0]?.FAC_ID;
};

// 설비 등록
const facilityInsert = async (data) => {
  const newId = await getNextFacilityId();
  const params = [
    newId,
    data.FAC_NAME,
    data.FAC_TYPE,
    data.FAC_USE ?? 1,
    data.FAC_COMPANY ?? null,
    data.FAC_MDATE ?? null,
    data.FAC_IDATE ?? null,
    data.FAC_CHECKDAY ?? null,
    data.PR_ID ?? null,
    data.MANAGER ?? null,
  ];
  await mariadb.query("facilityInsert", params);
  return newId;
};

// 설비 수정
const facilityUpdate = async (data) => {
  const params = [
    data.FAC_NAME,
    data.FAC_TYPE,
    data.FAC_USE ?? 1,
    data.FAC_COMPANY ?? null,
    data.FAC_MDATE ?? null,
    data.FAC_IDATE ?? null,
    data.FAC_CHECKDAY ?? null,
    data.PR_ID ?? null,
    data.MANAGER ?? null,
    data.FAC_ID,
  ];
  return await mariadb.query("facilityUpdate", params);
};

// 설비 삭제
const facilityDelete = async ({ FAC_ID }) => {
  return await mariadb.query("facilityDelete", [FAC_ID]);
};

// FAC_TYPE별 설비
const facilitySelectByFacType = async (facType) => {
  return await mariadb.query("facilitySelectByFacType", [facType, facType]);
};

// 상태 목록(최신 1건 포함)
const facilityStatusList = async () => {
  return await mariadb.query("facilityStatusList");
};

// 특정 설비 최신 상태
const facilityStatusCurrentByFac = async (facId) => {
  return await mariadb.query("facilityStatusCurrentByFac", [facId]);
};

// 비가동 설정/업데이트
const facilityStatusUpdateToDown = async (data) => {
  const params = [
    data.FS_STATUS ?? 1,
    data.FS_REASON ?? null,
    data.FS_TYPE ?? null,
    data.DOWN_STARTDAY ?? null,
    data.FS_CHECKDAY ?? null,
    data.FS_NEXTDAY ?? null,
    data.MANAGER ?? null,
    data.FS_ID,
  ];
  return await mariadb.query("facilityStatusUpdateToDown", params);
};

// 비가동 종료
const facilityStatusEndDowntime = async ({
  FS_ID,
  endTime,
  restoreStatus = 0,
  checkTime = null,
  MANAGER = null,
  repairContent = null,
  repairNote = null,
}) => {
  // 1) 상태 종료
  const params = [endTime, restoreStatus, checkTime, MANAGER, FS_ID];
  await mariadb.query("facilityStatusEndDowntime", params);

  if (
    (repairContent && String(repairContent).trim() !== "") ||
    (repairNote && String(repairNote).trim() !== "")
  ) {
    await mariadb.query("facilityRepairInsertByFsId", [
      repairContent ?? null,
      repairNote ?? null,
      MANAGER ?? null,
      FS_ID,
    ]);
  }

  return true;
};

// 상태 이력 필터
const facilityStatusFilter = async ({
  facId = null,
  startDate = null,
  endDate = null,
}) => {
  const params = [facId, facId, startDate, startDate, endDate, endDate];
  return await mariadb.query("facilityStatusFilter", params);
};

// 수리 목록(전체)
const facilityRepairList = async () => {
  return await mariadb.query("facilityRepairList");
};

// 수리 목록(설비별)
const facilityRepairByFacId = async (facId) => {
  return await mariadb.query("facilityRepairByFacId", [facId]);
};

// 진행중 점검
const facilityOpenInspections = async () => {
  return await mariadb.query("facilityOpenInspections");
};

// 점검 기록 저장
const facilityCheckInsert = async ({
  FS_ID,
  FAC_ID,
  FC_NEXTDAY,
  FC_SUIT,
  FC_SUIT_REASON,
  FC_CONTENT,
  MANAGER,
}) => {
  const params = [
    FC_NEXTDAY ?? null,
    FC_SUIT ?? null,
    FC_SUIT_REASON ?? null,
    FC_CONTENT ?? null,
    MANAGER ?? null,
    FS_ID,
    FAC_ID,
  ];
  return await mariadb.query("facilityCheckInsert", params);
};

// 점검 종료
const facilityStatusEndInspection = async ({
  FS_ID,
  endTime,
  restoreStatus = 0,
  checkTime = null,
  nextCheck = null,
  MANAGER = null,
}) => {
  const params = [endTime, restoreStatus, checkTime, nextCheck, MANAGER, FS_ID];
  return await mariadb.query("facilityStatusEndInspection", params);
};

// 점검 이력
const facilityInspectionHistory = async ({
  facId = null,
  startDate = null,
  endDate = null,
}) => {
  const params = [facId, facId, startDate, startDate, endDate, endDate];
  return await mariadb.query("facilityInspectionHistory", params);
};

// 공통코드(그룹)
const getCodesByGroup = async (group) => {
  return await mariadb.query("codeByGroup", [group]);
};
// 공정 목록(모달용)
const getProcessList = async () => {
  return await mariadb.query("processList");
};

module.exports = {
  facilitySelect,
  facilityById,
  facilityInsert,
  getNextFacilityId,
  facilityUpdate,
  facilityDelete,
  facilitySelectByFacType,
  facilityStatusList,
  facilityStatusCurrentByFac,
  facilityStatusUpdateToDown,
  facilityStatusEndDowntime,
  facilityStatusFilter,
  facilityRepairList,
  facilityRepairByFacId,
  facilityOpenInspections,
  facilityCheckInsert,
  facilityStatusEndInspection,
  facilityInspectionHistory,
  getCodesByGroup,
  getProcessList,
};
