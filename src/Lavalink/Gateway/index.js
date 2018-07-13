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
          console.log('RECOVER' + player.channel_id)
        shardNum = parseInt(idToBinary(player.guild_id).slice(0, -22), 2) % shards || 0
        if (player.channel_id) {
          await this.channel.sendToQueue({
            t: 'VOICE_STATE_UPDATE',
            d: {
              shard_id: shardNum,
              guild_id: player.guild_id,
              channel_id: player.channel_id,
              self_mute: false,
              self_deaf: false
            }
          })
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
}

module.exports = LavalinkGateway
