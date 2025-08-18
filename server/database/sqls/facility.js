// server/database/sqls/facility.js
module.exports = {
  /* 다음 설비ID (프론트에서 표시용) */
  nextFacilityId: `
    SELECT GetNextFAC_ID() AS FAC_ID
  `,

  /* 설비 목록 (조회 화면 데이터) */
  facilitySelect: `
    SELECT
      f.FAC_ID,
      f.FAC_NAME,
      f.FAC_TYPE,
      cm.code_name AS FAC_TYPE_NM,
      f.FAC_USE,
      f.FAC_COMPANY,
      f.FAC_MDATE,
      f.FAC_IDATE,
      f.FAC_CHECKDAY,
      f.PR_ID,
      f.MANAGER
    FROM FACILITY f
    LEFT JOIN code_master cm
      ON cm.group_code = 'FC' AND cm.code = f.FAC_TYPE
    ORDER BY f.FAC_ID
  `,

  /* 설비 등록
     - FAC_TYPE(코드/이름/이름-‘설비’제거)과 PROCESS.FAC_TYPE을 유연 매칭
     - 매칭 실패해도 PR_ID는 PROCESS의 첫 코드로 폴백 → NOT NULL 충족
  */
  facilityInsert: `
    INSERT INTO FACILITY
      (FAC_ID, FAC_NAME, FAC_TYPE, FAC_USE, FAC_COMPANY,
       FAC_MDATE, FAC_IDATE, FAC_CHECKDAY, PR_ID, MANAGER)
    VALUES (
      GetNextFAC_ID(),
      ?, ?, ?, ?, ?, ?, ?,
      COALESCE(
        ( /* 1차: 그대로 비교 */
          SELECT p.PRC_CODE
            FROM PROCESS p
           WHERE REPLACE(p.FAC_TYPE, ' ', '') = REPLACE(?, ' ', '')
           ORDER BY p.PRC_CODE
           LIMIT 1
        ),
        ( /* 2차: code → code_name 비교 */
          SELECT p.PRC_CODE
            FROM PROCESS p
           WHERE REPLACE(p.FAC_TYPE, ' ', '') = REPLACE((
                   SELECT cm.code_name
                     FROM code_master cm
                    WHERE cm.group_code = 'FC' AND cm.code = ?
                 ), ' ', '')
           ORDER BY p.PRC_CODE
           LIMIT 1
        ),
        ( /* 3차: code_name에서 '설비' 꼬리표 제거 후 비교 */
          SELECT p.PRC_CODE
            FROM PROCESS p
           WHERE REPLACE(p.FAC_TYPE, ' ', '') = REPLACE((
                   SELECT TRIM(REPLACE(cm.code_name, '설비', ''))
                     FROM code_master cm
                    WHERE cm.group_code = 'FC' AND cm.code = ?
                 ), ' ', '')
           ORDER BY p.PRC_CODE
           LIMIT 1
        ),
        ( /* 최종 폴백: PROCESS 첫 코드 */
          SELECT p.PRC_CODE
            FROM PROCESS p
           ORDER BY p.PRC_CODE
           LIMIT 1
        )
      ),
      ?
    )
  `,

  /* 설비 수정 (등록과 동일 로직으로 PR_ID 재계산) */
  facilityUpdate: `
    UPDATE FACILITY
       SET FAC_NAME     = ?,
           FAC_TYPE     = ?,
           FAC_USE      = ?,
           FAC_COMPANY  = ?,
           FAC_MDATE    = ?,
           FAC_IDATE    = ?,
           FAC_CHECKDAY = ?,
           PR_ID = COALESCE(
             (SELECT p.PRC_CODE
                FROM PROCESS p
               WHERE REPLACE(p.FAC_TYPE, ' ', '') = REPLACE(?, ' ', '')
               ORDER BY p.PRC_CODE
               LIMIT 1),
             (SELECT p.PRC_CODE
                FROM PROCESS p
               WHERE REPLACE(p.FAC_TYPE, ' ', '') = REPLACE((
                       SELECT cm.code_name FROM code_master cm
                        WHERE cm.group_code='FC' AND cm.code=?
                     ), ' ', '')
               ORDER BY p.PRC_CODE
               LIMIT 1),
             (SELECT p.PRC_CODE
                FROM PROCESS p
               WHERE REPLACE(p.FAC_TYPE, ' ', '') = REPLACE((
                       SELECT TRIM(REPLACE(cm.code_name, '설비',''))
                         FROM code_master cm
                        WHERE cm.group_code='FC' AND cm.code=?
                     ), ' ', '')
               ORDER BY p.PRC_CODE
               LIMIT 1),
             (SELECT p.PRC_CODE FROM PROCESS p ORDER BY p.PRC_CODE LIMIT 1)
           ),
           MANAGER = ?
     WHERE FAC_ID = ?
  `,

  facilityDelete: `
    DELETE FROM FACILITY WHERE FAC_ID = ?
  `,
};
