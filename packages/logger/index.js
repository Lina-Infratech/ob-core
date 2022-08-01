const logger = require('./winston')

class Logger {
  static info = (req, category, message) => {
    const tenant_id = req.tenant ? req.tenant.id : null

    category = category.toUpperCase()
    message = `[${category}] ${message}`

    logger.info(message, { tenant_id, category })
  }
  
  static warn = (req, category, message) => {
      const tenant_id = req.tenant ? req.tenant.id : null

    category = category.toUpperCase()
    message = `[${category}] ${message}`
    
    logger.warn(message, { tenant_id, category })
  }
  
  static error = (req, category, message) => {
    const tenant_id = req.tenant ? req.tenant.id : null

    category = category.toUpperCase()
    message = `[${category}] ${message}`
    
    logger.error(message, { tenant_id, category })
  }
}

module.exports = Logger