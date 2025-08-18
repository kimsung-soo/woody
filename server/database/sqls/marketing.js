// marketing.js

const insertAccount = `
    insert into CUSTOMERS (cus_id, cus_type, cus_name, cus_manager, cus_use, cus_note)
    values (nextCode("acc"), ?, ?, ?, ?, ?);
`;

module.exports = {
  insertAccount,
};
