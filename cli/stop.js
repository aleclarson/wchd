let quest = require('quest')
let sock = require('wch/lib/sock')
let fs = require('fsx')

let {WCH_DIR, SOCK_PATH} = require('../paths')

function stop() {
  let watcher, err = new Error()
  return new Promise((resolve, reject) => {
    watcher = fs.watch(WCH_DIR, (evt, file) => {
      if (file == 'server.sock') {
        good('Server stopped!')
        watcher.close()
        resolve(true)
      }
    })
    let req = sock.request('POST', '/stop')
    quest.ok(req, err).catch(reject)
  }).catch(err => {
    if (watcher) watcher.close()
    if (/^(ENOENT|ECONNREFUSED)$/.test(err.code)) {
      warn('Server not running.')
      fs.removeFile(SOCK_PATH, false)
      return false
    }
    fatal(err)
  })
}

module.exports = stop
