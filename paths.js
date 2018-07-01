let path = require('path')
let os = require('os')

let WCH_DIR
if (process.env.NODE_ENV == 'test') {
  WCH_DIR = path.join(os.tmpdir(), '.wch')
} else {
  WCH_DIR = path.join(os.homedir(), '.wch')
}

let LOG_NAME = 'debug.log'
let SOCK_NAME = 'server.sock'

module.exports = {
  WCH_DIR,
  LOG_NAME,
  LOG_PATH: path.join(WCH_DIR, LOG_NAME),
  SOCK_NAME,
  SOCK_PATH: path.join(WCH_DIR, SOCK_NAME),
}
