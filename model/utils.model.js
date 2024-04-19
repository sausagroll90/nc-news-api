const db = require("../db/connection");

exports.checkExists = async (table, column, value) => {
  const { rows } = await db.query(`SELECT * FROM ${table} WHERE ${column}=$1`, [
    value,
  ]);
  return rows.length !== 0;
};

exports.handleSimple404 = (modelFunc, errorMsg) => {
  const wrappedModelFunc = async (...args) => {
    const result = await modelFunc(...args);
    if (!result || (Array.isArray(result) && result.length === 0)) {
      return Promise.reject({ status: 404, msg: errorMsg });
    }
    return result;
  };
  return wrappedModelFunc;
};
