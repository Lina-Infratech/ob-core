const axios = require('axios');
const httpStatus = require('http-status');
const errors = require('../errors');
const ConfigPostgres = require('../factory/configPostgres');
const { Database } = require(process.cwd() + '/src/database/index');
const { cache } = require('../cache/tenantsCache')

module.exports = async (req, res, next) => {
  try {
    const tenant_id = req.headers.tenant_id;
    const key = `${process.env.MS}_${tenant_id}`;
    const cacheExists = cache.get(key);
    let postgres = null;

    if (!tenant_id) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ errors: [errors.ERROR_TENANT_ID_REQUIRED] });
    }

    if (process.env.MS_ONBOARD_HOST == null && process.env.MS == null) {
      throw new Error(errors.ERROR_ENVIROMENT_VARIABLES_MISSING)
    }

    if (cacheExists == undefined) {
      const { data } =
        await axios.get(`${process.env.MS_ONBOARD_HOST}/api/v1/tenants/${tenant_id}`);

      cache.set(key, data);

      postgres = data.postgres
    } else {
      postgres = cacheExists.postgres
    }

    const {
      hostname,
      port,
      username,
      password,
      db_name,
    } = postgres.find((value) => value.microservice === process.env.MS)

    const config = new ConfigPostgres(hostname, username, password, port, db_name)

    const models = new Database().init(config);

    req.models = models;

    return next();
  } catch (error) {
    console.error(error)
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json({ errors: [errors.ERROR_TENANT_ID_NOT_EXISTS] });
  }
};