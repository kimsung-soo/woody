// table명 : matarials

// 각 변수별로 SQL문을 등록할 떄 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )

const matarialsAllSelect = `SELECT mat_code, mat_name, mat_type, mat_unit, mat_width, mat_height, mat_dept, mat_safeqt, mat_date, mat_note, mat_writer
FROM matarials`;
