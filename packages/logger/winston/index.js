const moment = require("moment");
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf } = format;
const errors = require("../../utils/enums/errorsEnum");

const myFormat = printf((info) => {
  return `[${moment(info.timestamp).format("DD/MM/YYYY HH:mm:ss.SSS")}] [${
    info.level
  }] [${info.label}]: ${info.message}`;
});

if (process.env.NODE_ENV && process.env.MS == null) {
  throw new Error(errors.ERROR_ENVIROMENT_VARIABLES_MISSING);
}

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
    ],
  });

  return logger;
};

module.exports = logger();
