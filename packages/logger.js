const { createLogger, format, transports } = require("winston");

class Logger {
  constructor(info, dateFormat, stackTrace, service) {
    this.info = info;
    this.dateFormat = dateFormat;
    this.stackTrace = stackTrace;
    this.service = service;
    this.bootstrap();
  }

  bootstrap = () => {
    try {
      console.log(this);
      return null;
    } catch (err) {
      return err;
    }
  };

  // const logger = createLogger({
  //   level: 'info',
  //   format: format.combine(
  //     format.timestamp({
  //       format: 'YYYY-MM-DD HH:mm:ss',
  //     }),
  //     format.errors({ stack: true }),
  //     format.splat(),
  //     format.json()
  //   ),
  //   defaultMeta: { service: 'ob-orchestrator' },
  //   transports: [
  //     //
  //     // - Write to all logs with level `info` and below to `quick-start-combined.log`.
  //     // - Write all logs error (and below) to `quick-start-error.log`.
  //     //
  //     new transports.File({ filename: 'logs/errors.log', level: 'error' }),
  //     new transports.File({ filename: 'logs/combined.log' }),
  //   ],
  // });
}

module.exports = Logger;
