'use strict'

const { version } = require('../package.json')
exports.version = version || 'error'

exports.Logger = require('./Logger')
exports.LavalinkGatway = require('./Lavalink/Gateway')
exports.LavalinkWorker = require('./Lavalink/Worker')
exports.Utils = require('./Utils')
