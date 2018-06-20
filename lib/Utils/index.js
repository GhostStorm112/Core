function ParseArgs (args = process.argv) {
  if (args.length < 3) { return { } }

  return args.slice(2).join(' ').split(/ (?=-)/).reduce((obj, arg) => {
    let [, key, value] = arg.match(/(?:-{1,2}([a-zA-Z\-_]+))[= ](.+)/)
    if (/^\d+$/.test(value)) { value = parseInt(value) }

    obj[key.replace(/[-_]([a-z])/g, m => m[1].toUpperCase())] =
value
    return obj
  }, { })
}

const camelCaseCache = { }
function CamelCaseEventName (string) {
  return camelCaseCache[string] || (camelCaseCache[string] =
string.toLowerCase().replace(/[_]([a-z])/g, m => m[1].toUpperCase()))
}

function idTobinary (guildId){
  let bin = '';
  let high = parseInt(guildId.slice(0, -10), 10) || 0
  let low = parseInt(guildId.slice(-10), 10)
  while (low > 0 || high > 0) {
    bin = String(low * 1) + bin
    low = Math.floor(low / 2)
    if(high > 0) {
      low += 5000000000 * (high % 2)
      high = Math.floor(high / 2)
    }
  }
  return bin
}

module.exports = {
  ParseArgs,
  CamelCaseEventName,
  idTobinary
}