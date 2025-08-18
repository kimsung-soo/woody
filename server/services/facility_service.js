const mariadb = require("../database/mapper.js");

// 리스트
const facilitySelect = async () => {
  return await mariadb.query("facilitySelect");
};
const facilityById = async (data) => {
  return await mariadb.query("facilityById", [data.FAC_ID]);
};

// 등록
const facilityInsert = async (data) => {
  const params = [
    data.FAC_ID,
    data.FAC_NAME,
    data.FAC_TYPE,
    data.FAC_USE ?? 1,
    data.FAC_COMPANY,
    data.FAC_MDATE ?? null,
    data.FAC_IDATE ?? null,
    data.FAC_CHECKDAY ?? null,
    data.PR_ID,
    data.MANAGER ?? null,
  ];
  return await mariadb.query("facilityInsert", params);
};

// 수정
const facilityUpdate = async (data) => {
  const params = [
    data.FAC_NAME,
    data.FAC_TYPE,
    data.FAC_USE,
    data.FAC_COMPANY,
    data.FAC_MDATE,
    data.FAC_IDATE,
    data.FAC_CHECKDAY,
    data.PR_ID,
    data.MANAGER,
    data.FAC_ID,
  ];
  return await mariadb.query("facilityUpdate", params);
};

// 삭제
const facilityDelete = async (data) => {
  return await mariadb.query("facilityDelete", [data.FAC_ID]);
};
/** 공통코드: 그룹코드별 조회 */
const getCodesByGroup = async (groupCode) => {
  return await mariadb.query("codeByGroup", [groupCode]);
};

/** 설비상태 목록 */
const facilityStatusList = async () => {
  return await mariadb.query("facilityStatusList");
};

/** 설비별 **/
const facilityStatusCurrentByFac = async (facId) => {
  return await mariadb.query("facilityStatusCurrentByFac", [facId]);
};

/** 설비상태 신규 등록(비가동 시작 포함) */
const facilityStatusInsert = async (data) => {
  const params = [
    data.FS_ID,
    data.FAC_ID,
    data.FS_STATUS,
    data.FS_REASON ?? null,
    data.FS_TYPE ?? null, // RR 코드값 저장
    data.DOWN_STARTDAY ?? null,
    data.FS_CHECKDAY ?? null,
    data.FS_NEXTDAY ?? null,
    data.MANAGER ?? null,
  ];
  return await mariadb.query("facilityStatusInsert", params);
};

/** 비가동 종료(종료시간 + 상태 복귀) */
const facilityStatusEndDowntime = async ({
  FS_ID,
  endTime,
  restoreStatus = 0,
  checkTime = null,
}) => {
  return await mariadb.query("facilityStatusEndDowntime", [
    endTime,
    restoreStatus,
    checkTime,
    FS_ID,
  ]);
};

/** 필터 조회 */
const facilityStatusFilter = async ({
  facId = null,
  startDate = null,
  endDate = null,
}) => {
  return await mariadb.query("facilityStatusFilter", [
    facId,
    facId,
    startDate,
    startDate,
    endDate,
    endDate,
  ]);
};

module.exports = {
  // 기존 export들 유지…
  facilitySelect,
  facilityById,
  facilityInsert,
  facilityUpdate,
  facilityDelete,

  // 추가 export
  getCodesByGroup,
  facilityStatusList,
  facilityStatusCurrentByFac,
  facilityStatusInsert,
  facilityStatusEndDowntime,
  facilityStatusFilter,
};
