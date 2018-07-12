'use strict'

const { Client: Lavaqueue } = require('lavaqueue')

class LavalinkWorker extends Lavaqueue {
  constructor (options = {}) {
    super({
      userID: options.user,
      password: options.password,
      hosts: {
        rest: options.rest,
        ws: options.ws,
        redis: process.env.REDIS_URL,
        shard: options.shard
      }
    })

    this.gateway = options.shard
    this.redis = options.redis
  }

  async send (event) {
    return this.gateway.sendWS(0, event.t, event.d)
}
}
module.exports = LavalinkWorker
