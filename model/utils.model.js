const db = require("../db/connection");

exports.checkExists = async (table, column, value) => {
  const { rows } = await db.query(`SELECT * FROM ${table} WHERE ${column}=$1`, [
    value,
  ]);
  return rows.length !== 0;
};
