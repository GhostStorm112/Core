'use strict'

const { version } = require('../package.json')
exports.version = version || 'error'

exports.Logger = require('./Logger')
