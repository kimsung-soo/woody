module.exports = {
  // 리스트
  facilitySelect: `
    SELECT 
      FAC_ID, FAC_NAME, FAC_TYPE, FAC_USE, FAC_COMPANY,
      FAC_MDATE, FAC_IDATE, FAC_CHECKDAY, PR_ID, MANAGER
    FROM FACILITY
    ORDER BY FAC_ID
  `,

  // 단건
  facilityById: `
    SELECT 
      FAC_ID, FAC_NAME, FAC_TYPE, FAC_USE, FAC_COMPANY,
      FAC_MDATE, FAC_IDATE, FAC_CHECKDAY, PR_ID, MANAGER
    FROM FACILITY
    WHERE FAC_ID = ?
  `,

  // 등록
  facilityInsert: `
    INSERT INTO FACILITY
      (FAC_ID, FAC_NAME, FAC_TYPE, FAC_USE, FAC_COMPANY,
       FAC_MDATE, FAC_IDATE, FAC_CHECKDAY, PR_ID, MANAGER)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,

  // 수정
  facilityUpdate: `
    UPDATE FACILITY
      SET FAC_NAME=?, FAC_TYPE=?, FAC_USE=?, FAC_COMPANY=?,
          FAC_MDATE=?, FAC_IDATE=?, FAC_CHECKDAY=?, PR_ID=?, MANAGER=?
    WHERE FAC_ID=?
  `,

  // 삭제
  facilityDelete: `
    DELETE FROM FACILITY WHERE FAC_ID=?
  `,

  codeByGroup: `
    SELECT code, code_name
    FROM code_master
    WHERE group_code = ?
    ORDER BY sort_order, code
  `,

  /* 설비상태 목록: 고장유형명 조인 */
  facilityStatusList: `
    SELECT 
      fs.FS_ID,
      fs.FAC_ID,
      f.FAC_NAME,
      fs.FS_STATUS,
      fs.FS_REASON,
      fs.FS_TYPE,                    
      cm.code_name AS FS_TYPE_NM,   
      fs.DOWN_STARTDAY,
      fs.DOWN_ENDDAY,
      fs.FS_CHECKDAY,
      fs.FS_NEXTDAY,
      fs.MANAGER
    FROM FACILITY_STATUS fs
    JOIN FACILITY f ON fs.FAC_ID = f.FAC_ID
    LEFT JOIN code_master cm
      ON cm.group_code = 'RR' AND cm.code = fs.FS_TYPE
    ORDER BY COALESCE(fs.FS_CHECKDAY, fs.DOWN_STARTDAY, NOW()) DESC
  `,

  /* 특정 설비  */
  facilityStatusCurrentByFac: `
    SELECT 
      fs.*,
      cm.code_name AS FS_TYPE_NM
    FROM FACILITY_STATUS fs
    LEFT JOIN code_master cm
      ON cm.group_code = 'RR' AND cm.code = fs.FS_TYPE
    WHERE fs.FAC_ID = ?
    ORDER BY COALESCE(fs.FS_CHECKDAY, fs.DOWN_STARTDAY, NOW()) DESC
    LIMIT 1
  `,

  /* 신규 등록/종료 처리  */
  facilityStatusInsert: `
    INSERT INTO FACILITY_STATUS
      (FS_ID, FAC_ID, FS_STATUS, FS_REASON, FS_TYPE, DOWN_STARTDAY, FS_CHECKDAY, FS_NEXTDAY, MANAGER)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  facilityStatusEndDowntime: `
    UPDATE FACILITY_STATUS
    SET 
      DOWN_ENDDAY = ?,
      FS_STATUS = ?,
      FS_CHECKDAY = ?
    WHERE FS_ID = ?
  `,

  /* 필터 조회: 고장유형명 포함 */
  facilityStatusFilter: `
    SELECT 
      fs.FS_ID, fs.FAC_ID, f.FAC_NAME, fs.FS_STATUS, fs.FS_REASON,
      fs.FS_TYPE, cm.code_name AS FS_TYPE_NM,
      fs.DOWN_STARTDAY, fs.DOWN_ENDDAY, fs.FS_CHECKDAY, fs.FS_NEXTDAY, fs.MANAGER
    FROM FACILITY_STATUS fs
    JOIN FACILITY f ON fs.FAC_ID = f.FAC_ID
    LEFT JOIN code_master cm
      ON cm.group_code = 'RR' AND cm.code = fs.FS_TYPE
    WHERE ( ? IS NULL OR fs.FAC_ID = ? )
      AND ( ? IS NULL OR DATE(fs.DOWN_STARTDAY) >= DATE(?) )
      AND ( ? IS NULL OR DATE(fs.DOWN_STARTDAY) <= DATE(?) )
    ORDER BY fs.DOWN_STARTDAY DESC
  `,
};
