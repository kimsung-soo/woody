const nextFacilityId = `
  SELECT GetNextFAC_ID() AS FAC_ID
`;
// 공정 목록(모달용)
const processList = `
  SELECT PRC_CODE, PRC_NAME, FAC_TYPE, PRC_RDATE, PRC_WRITER, PRC_NOTE
  FROM PROCESS
  ORDER BY PRC_CODE
`;

const facilitySelect = `
  SELECT
    FAC_ID, FAC_NAME, FAC_TYPE, FAC_USE, FAC_COMPANY,
    FAC_MDATE, FAC_IDATE, FAC_CHECKDAY, PR_ID, MANAGER
  FROM FACILITY
  ORDER BY FAC_ID
`;

const facilityById = `
  SELECT
    FAC_ID, FAC_NAME, FAC_TYPE, FAC_USE, FAC_COMPANY,
    FAC_MDATE, FAC_IDATE, FAC_CHECKDAY, PR_ID, MANAGER
  FROM FACILITY
  WHERE FAC_ID = ?
`;

const facilityInsert = `
  INSERT INTO FACILITY(
    FAC_ID, FAC_NAME, FAC_TYPE, FAC_USE, FAC_COMPANY,
    FAC_MDATE, FAC_IDATE, FAC_CHECKDAY, PR_ID, MANAGER
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const facilityUpdate = `
  UPDATE FACILITY
     SET FAC_NAME = ?,
         FAC_TYPE = ?,
         FAC_USE  = ?,
         FAC_COMPANY = ?,
         FAC_MDATE   = ?,
         FAC_IDATE   = ?,
         FAC_CHECKDAY= ?,
         PR_ID   = ?,
         MANAGER = ?
   WHERE FAC_ID = ?
`;

const facilityDelete = `
  DELETE FROM FACILITY
  WHERE FAC_ID = ?
`;

//   간단 조회
const facilitySelectByFacType = `
  SELECT
    FAC_ID, FAC_NAME, FAC_TYPE, FAC_USE, FAC_COMPANY,
    FAC_MDATE, FAC_IDATE, FAC_CHECKDAY, PR_ID, MANAGER
  FROM FACILITY
  WHERE ( ? IS NULL OR FAC_TYPE = ? )
  ORDER BY FAC_ID
`;

// 공통코드
const codeByGroup = `
  SELECT
    code,
    code_name
  FROM code_master
  WHERE group_code = ?
    AND (use_yn IS NULL OR use_yn IN ('Y','1'))
  ORDER BY COALESCE(sort_order, 9999), code_name
`;

// 설비 상태

const facilityStatusList = `
  SELECT
    f.FAC_ID,  f.FAC_NAME, f.FAC_TYPE, f.PR_ID, f.FAC_COMPANY,f.MANAGER, f.FAC_MDATE, f.FAC_IDATE, f.FAC_CHECKDAY,
    s.FS_ID, s.FS_STATUS, s.FS_REASON, s.FS_TYPE,
    s.DOWN_STARTDAY, s.DOWN_ENDDAY, s.FS_CHECKDAY, s.FS_NEXTDAY, s.MANAGER AS STATUS_MANAGER
  FROM FACILITY f
  LEFT JOIN FACILITY_STATUS s
    ON s.FAC_ID = f.FAC_ID
   AND CAST(SUBSTRING(s.FS_ID, 3) AS UNSIGNED) = (
      SELECT MAX(CAST(SUBSTRING(FS_ID, 3) AS UNSIGNED))
      FROM FACILITY_STATUS
      WHERE FAC_ID = f.FAC_ID
   )
  ORDER BY f.FAC_ID
`;

// 상태 신규
const facilityStatusInsert = `
  INSERT INTO FACILITY_STATUS(
    FS_ID, FAC_ID, FS_STATUS, FS_REASON, FS_TYPE,
    DOWN_STARTDAY, DOWN_ENDDAY, FS_CHECKDAY, FS_NEXTDAY, MANAGER
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;
//상태 수정
const facilityStatusUpdateToDown = `
  UPDATE FACILITY_STATUS
     SET FS_STATUS     = ?,
         FS_REASON     = ?,
         FS_TYPE       = ?,
         DOWN_STARTDAY = ?,
         FS_CHECKDAY   = ?,
         FS_NEXTDAY    = ?,
         MANAGER       = ?
   WHERE FS_ID = ?
`;

const facilityStatusEndDowntime = `
  UPDATE FACILITY_STATUS
     SET DOWN_ENDDAY = ?,
         FS_STATUS   = ?,
         FS_CHECKDAY = ?,
         MANAGER     = COALESCE(?, MANAGER)
   WHERE FS_ID = ?
`;

// 특정 설비
const facilityStatusCurrentByFac = `
  SELECT *
  FROM FACILITY_STATUS
  WHERE FAC_ID = ?
  ORDER BY CAST(SUBSTRING(FS_ID, 3) AS UNSIGNED) DESC
  LIMIT 1
`;

// 상태 이력
const facilityStatusFilter = `
  SELECT
    s.*, f.FAC_NAME, f.PR_ID
  FROM FACILITY_STATUS s
  JOIN FACILITY f ON f.FAC_ID = s.FAC_ID
  WHERE ( ? IS NULL OR s.FAC_ID = ? )
    AND ( ? IS NULL OR DATE(s.DOWN_STARTDAY) >= DATE(?) )
    AND ( ? IS NULL OR DATE(COALESCE(s.DOWN_ENDDAY, NOW())) <= DATE(?) )
  ORDER BY s.DOWN_STARTDAY DESC, s.FS_ID DESC
`;

// 수리

const facilityRepairList = `
  SELECT
    FR_ID, FS_ID, FAC_ID, FR_TYPE, FR_CONTENT, FR_NOTE, MANAGER
  FROM FACILITY_REPAIR
  ORDER BY FR_ID DESC
`;

const facilityRepairByFacId = `
  SELECT
    FR_ID, FS_ID, FAC_ID, FR_TYPE, FR_CONTENT, FR_NOTE, MANAGER
  FROM FACILITY_REPAIR
  WHERE FAC_ID = ?
  ORDER BY FR_ID DESC
`;

// 수리 기록
const facilityRepairInsertByFsId = `
  INSERT INTO FACILITY_REPAIR
    (FR_TYPE, FR_CONTENT, FR_NOTE, MANAGER, FS_ID, FAC_ID)
  SELECT
    s.FS_TYPE, ?, ?, ?, s.FS_ID, s.FAC_ID
  FROM FACILITY_STATUS AS s
  WHERE s.FS_ID = ?
`;

// 점검

const facilityOpenInspections = `
  SELECT
    FS_ID, FAC_ID, FS_REASON, FS_TYPE,
    DOWN_STARTDAY, FS_CHECKDAY, FS_NEXTDAY, MANAGER
  FROM FACILITY_STATUS
  WHERE FS_REASON = '점검'
    AND DOWN_ENDDAY IS NULL
  ORDER BY DOWN_STARTDAY DESC, FS_ID DESC
`;

const facilityStatusEndInspection = `
  UPDATE FACILITY_STATUS
     SET DOWN_ENDDAY = ?,
         FS_STATUS   = ?,
         FS_CHECKDAY = ?,
         FS_NEXTDAY  = ?,
         MANAGER     = COALESCE(?, MANAGER)
   WHERE FS_ID = ?
`;

const facilityInspectionHistory = `
  SELECT
    s.FS_ID, s.FAC_ID,
    COALESCE(s.DOWN_STARTDAY, s.FS_CHECKDAY) AS INSPECT_START,
    s.FS_CHECKDAY AS INSPECT_DONE,
    c.FC_NEXTDAY  AS NEXT_INSPECT,
    c.FC_CONTENT  AS INSPECT_CONTENT,
    c.FC_SUIT     AS FIT,
    c.FC_SUIT_REASON AS NG_REASON,
    COALESCE(s.MANAGER, c.MANAGER) AS MANAGER
  FROM FACILITY_STATUS s
  JOIN FACILITY_CHECK  c ON c.FS_ID = s.FS_ID
  WHERE s.FS_REASON = '점검'
    AND s.DOWN_ENDDAY IS NOT NULL
    AND ( ? IS NULL OR s.FAC_ID = ? )
    AND ( ? IS NULL OR DATE(s.FS_CHECKDAY) >= DATE(?) )
    AND ( ? IS NULL OR DATE(s.FS_CHECKDAY) <= DATE(?) )
  ORDER BY s.FS_CHECKDAY DESC, s.FS_ID DESC
`;

// 점검 등록
const facilityCheckInsert = `
  INSERT INTO FACILITY_CHECK
    (FC_NEXTDAY, FC_SUIT, FC_SUIT_REASON, FC_CONTENT, MANAGER, FS_ID, FAC_ID)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`;

module.exports = {
  // 설비
  nextFacilityId,
  facilitySelect,
  facilityById,
  facilityInsert,
  facilityUpdate,
  facilityDelete,
  facilitySelectByFacType,
  codeByGroup,
  processList,

  // 상태
  facilityStatusList,
  facilityStatusInsert,
  facilityStatusUpdateToDown,
  facilityStatusEndDowntime,
  facilityStatusFilter,
  facilityStatusCurrentByFac,

  // 수리
  facilityRepairList,
  facilityRepairByFacId,
  facilityRepairInsertByFsId,

  // 점검
  facilityOpenInspections,
  facilityStatusEndInspection,
  facilityInspectionHistory,
  facilityCheckInsert,
};
