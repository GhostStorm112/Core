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
    const players = await this.redis.storage.get('players', { type: 'arr' })
    if (players) {
      let shardNum
      for (const player of players) {
        shardNum = parseInt(idToBinary(player.guild_id).slice(0, -22), 2) % shards
        if (player.channel_id) {
          await this.channel.sendToQueue('weather-gateway-requests', Buffer.from(JSON.stringify({
            t: 'VOICE_STATE_UPDATE',
            d: {
              shard_id: shardNum,
              guild_id: player.guild_id,
              channel_id: player.channel_id,
              self_mute: false,
              self_deaf: false
            }
          })))
          await this.channel.sendToQueue('weather-gateway-requests', Buffer.from(JSON.stringify({
            t: 'VOICE_STATE_UPDATE',
            d: {
              shard_id: shardNum,
              guild_id: player.guild_id,
              channel_id: null,
              self_mute: false,
              self_deaf: false
            }
          })))
          await this.channel.sendToQueue('weather-gateway-requests', Buffer.from(JSON.stringify({
            t: 'VOICE_STATE_UPDATE',
            d: {
              shard_id: shardNum,
              guild_id: player.guild_id,
              channel_id: player.channel_id,
              self_mute: false,
              self_deaf: false
            }
          })))
        }
      }
      await this.queues.start()
    }
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

  async idToBinary (num) {
    let bin = ''
    let high = parseInt(num.slice(0, -10), 10) || 0
    let low = parseInt(num.slice(-10), 10)
    while (low > 0 || high > 0) {
      bin = String(low & 1) + bin
      low = Math.floor(low / 2)
      if (high > 0) {
        low += 5000000000 * (high % 2)
        high = Math.floor(high / 2)
      }
    }
    return bin
  }
}

module.exports = LavalinkGateway
