'use strict'

const { createLogger, format, transports } = require('winston')

const LoggerModes = {
  NORMAL: 0,
  DEBUG: 1
}

class Logger {
  constructor (opts) {
    opts = Object.assign({}, {
      filename: null
    }, opts)

    this.transports = new Map()

    // winston instance
    this.logger = createLogger({
      level: 'verbose',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:SSSS' })
      )
    })

    // console transport
    this.addTransport('console', new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(info => {
          const rest = JSON.stringify(Object.assign({}, info, {
            level: undefined,
            message: undefined,
            splat: undefined,
            from: undefined,
            timestamp: undefined
          }))

          return `${info.timestamp} [${info.level}${info.from ? `/${info.from}` : ''}]: ${info.message}${rest !== '{}' ? ` ${rest}` : ''}`
        })
      )
    }))
  }

  addTransport (name, transport) {
    if (this.transports.has(name)) throw new Error('Transport already exists')

    this.transports.set(name, transport)
    this.logger.add(transport)
  }

  deleteTransport (name) {
    if (!this.transports.has(name)) return true
    const transport = this.transports.get(name)

    this.logger.delete(transport)

    this.transports.delete(name)
  }

  editTransport (name, k, v) {
    if (!this.transports.has(name)) return true
    const transport = this.transports.get(name)

    transport[k] = v
    this.transports.set(name, transport)
  }

  log (type, msg, metadata) {
    return this.logger.log(type, msg, metadata)
  }

  error (from, msg, metadata) {
    this.log('error', msg, Object.assign({}, metadata, { from }))
  }

  warn (from, msg, metadata) {
    this.log('warn', msg, Object.assign({}, metadata, { from }))
  }

  warning (...args) {
    this.warn(...args)
  }

  info (from, msg, metadata) {
    this.log('info', msg, Object.assign({}, metadata, { from }))
  }

  verbose (from, msg, metadata) {
    this.log('verbose', msg, Object.assign({}, metadata, { from }))
  }

  debug (from, msg, metadata) {
    this.log('debug', msg, Object.assign({}, metadata, { from }))
  }

  silly (from, msg, metadata) {
    this.log('silly', msg, Object.assign({}, metadata, { from }))
  }

  set mode (newMode) {
    // legacy support
    if (typeof newMode === 'number') {
      if (newMode === LoggerModes.DEBUG) newMode = 'debug'
      else if (newMode === LoggerModes.NORMAL) newMode = 'verbose'
    }

    this.editTransport('console', 'level', newMode)
  }
}

Logger.LoggerModes = LoggerModes

module.exports = Logger
