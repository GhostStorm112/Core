'use strict'

const { Client: Lavaqueue } = require('lavaqueue')
const idToBinary = require('../../Utils/').idToBinary

class LavalinkGateway extends Lavaqueue {
  constructor (options = {}) {
    super({
      userID: options.user,
      password: options.password,
      hosts: {
        rest: options.rest,
        ws: options.ws,
        redis: process.env.REDIS_URL
      }
    })

    this.channel = options.gateway
    this.redis = options.redis
  }

  async recover (shards) {
    console.log(shards)
  }
  async skip (guildId) {
    await this.queues.get(guildId).next()
  }

  async stop (guildId) {
    await this.queues.get(guildId).stop()
  }

  async send (event) {
    return this.channel.sendToQueue('weather-gateway-requests', Buffer.from(JSON.stringify(event)))
  }
}

module.exports = LavalinkGateway
