const moment = require('moment')
const { createLogger, format, transports, config, } = require('winston')
const { combine, timestamp, label, printf } = format
const errors = require('../../utils/enums/errorsEnum')

const myFormat = printf(info => {
  return `[${moment(info.timestamp).format('DD/MM/YYYY HH:mm:ss.SSS')}] [${info.level}] [${info.label}]: ${info.message}`
})

if (process.env.DD_HOST == null && process.env.DD_KEY == null && process.env.DD_SOURCE == null && process.env.NODE_ENV  && process.env.MS == null) {
  throw new Error(errors.ERROR_ENVIROMENT_VARIABLES_MISSING)
}

const httpTransportOptions = {
  host: process.env.DD_HOST,
  path: `/api/v2/logs?dd-api-key=${process.env.DD_KEY}&ddsource=${process.env.DD_SOURCE}&service=${process.env.MS}&env=${process.env.NODE_ENV}`,
  ssl: true
};

const logger = () => {
  const logger = createLogger({
    exitOnError: true,
    format: format.json(),
    transports: [
      new transports.Console({
        format: combine(
          label({ label: process.env.MS }),
          timestamp(),
          format.colorize(),
          myFormat
        ),
      }),
      new transports.Http(httpTransportOptions),
    ]
  })

  return logger
}

module.exports = logger()