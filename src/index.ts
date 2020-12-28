import { PluginProps } from "../types/types"
import commander from "../types/commander"
import { Battlefield } from "vu-rcon"

declare interface Config {
  enableBan: boolean
  enableKill: boolean
  enableKick: boolean
  enableMove: boolean
  enableNextRound: boolean
  enableRestartRound: boolean
  enableSay: boolean
}

declare interface Dependency {
  Commander: commander
}

module.exports = ({ logger, battlefield, config, dependency }: PluginProps<Config, Dependency>) => {

  const { manager } = dependency.Commander

  if (config.enableKill) {
    logger.info("enabling command 'kill'")
    manager.add("kill")
      .requiredScopes(["PLAYER#KILL"])
      .help("kills a player")
      .argument(({ player }) => player.name("target"))
      .argument(({ string }) => string.name("reason"))
      .execute<{ target: Battlefield.Player, reason: string }>(async ({ invoker, args, reply }) => {
        const { target, reason } = args
        logger.info(`${invoker.name} killed ${target.name}`)
        try {
          await battlefield.playerKill(target.name)
        } catch (e) {
          if (e.message.includes("SoldierNotAlive")) return reply("Soldier is already dead")
          throw e
        }
        if (reason.length > 1) battlefield.say(`kill reason ${reason}`, ["player", target.name])
        reply(`killed player ${target.name}`)
      })
  }

  if (config.enableKick) {
    logger.info("enabling command 'kick'")
    manager.add("kick")
      .requiredScopes(["PLAYER#KICK"])
      .help("kicks a player")
      .argument(({ player }) => player.name("target"))
      .argument(({ string }) => string.name("reason"))
      .execute<{ target: Battlefield.Player, reason: string }>(async ({ invoker, args, reply }) => {
        const { target, reason } = args
        logger.info(`${invoker.name} kicked ${target.name}`)
        await battlefield.playerKick(target.name, reason)
        reply(`kicked player ${target.name}`)
      })
  }

  if (config.enableBan) {
    logger.info("enabling command 'ban'")
    manager.add("ban")
      .requiredScopes(["PLAYER#BAN"])
      .help("bans a player")
      .argument(({ player }) => player.name("target"))
      .argument(({ string }) => string.name("reason"))
      .execute<{ target: Battlefield.Player, reason: string }>(async ({ invoker, args, reply }) => {
        const { target, reason } = args
        logger.info(`${invoker.name} bans ${target.name}`)
        await battlefield.addBan(["guid", target.guid], ["perm"], reason)
        reply(`banned player ${target.name}`)
      })
  }

  if (config.enableMove) {
    logger.info("enabling command 'move'")
    manager.add("move")
      .requiredScopes(["PLAYER#MOVE"])
      .help("moves a player into the opposit team")
      .argument(({ player }) => player.name("target"))
      .execute<{ target: Battlefield.Player }>(async ({ invoker, args, reply }) => {
        const { target } = args
        logger.info(`${invoker.name} moves ${target.name}`)
        await battlefield.playerMove(target.name, target.teamId === 1 ? 2 : 1, 0, true)
        reply(`moved player ${target.name}`)
      })
  }

  if (config.enableNextRound) {
    logger.info("enabling command 'nextround'")
    manager.add("nextround")
      .requiredScopes(["MAP#SWITCH"])
      .help("starts the next round")
      .execute(async ({ invoker }) => {
        logger.info(`${invoker.name} starts next round`)
        await battlefield.nextRound()
      })
  }

  if (config.enableNextRound) {
    logger.info("enabling command 'restartround'")
    manager.add("restartround")
      .requiredScopes(["MAP#SWITCH"])
      .help("restarts the round")
      .execute(async ({ invoker }) => {
        logger.info(`${invoker.name} restarts round`)
        await battlefield.restartRound()
      })
  }

  if (config.enableSay) {
    logger.info("enabling command 'say'")
    manager.add("say")
      .requiredScopes(["PLAYER#MESSAGE"])
      .help("sends a message as server")
      .argument(({ string }) => string.name("message"))
      .execute<{ message: string }>(async ({ invoker, args }) => {
        const { message } = args
        logger.info(`${invoker.name} says "${message}"`)
        await battlefield.say(message, ["all"])
      })
  }

}