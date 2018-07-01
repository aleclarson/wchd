let slurm = require('slurm')
let fs = require('fsx')
let cp = require('child_process')

function start() {
  let args = slurm({
    f: {type: 'boolean'},
    v: true,
  })

  if (args.f) {
    // Run the daemon in foreground.
    return require('../lib/daemon')
  }

  let {
    WCH_DIR,
    LOG_NAME,
    LOG_PATH,
    SOCK_NAME,
    SOCK_PATH,
  } = require('../paths')

  if (fs.exists(SOCK_PATH)) {
    return warn('Already started!')
  }

  warn('Starting server...')

  // Clear the log history.
  fs.writeFile(LOG_PATH, '')

  // Start the daemon.
  let daemonPath = require.resolve('../lib/daemon')
  let proc = cp.spawn('node', [daemonPath], {
    env: process.env,
    stdio: 'ignore',
    detached: true,
  }).on('error', (err) => {
    watcher.close()
    fatal(err)
  })

  // The socket is touched when the server is ready.
  let watcher = fs.watch(WCH_DIR, (evt, file) => {
    if (file == SOCK_NAME) {
      watcher.close()
      proc.unref()
      good('Server ready!')
    }
    else if (file == LOG_NAME) {
      let logs = fs.readFile(LOG_PATH)
      let regex = /(?:^|\n)([^\n:]*Error): (.*)((?:\n +at [^\n]+)*)/m
      let match = regex.exec(logs)
      if (match) fatal({
        name: 'ServerError',
        message: match[2],
        stack: match[3],
        inspect: () => match[0],
      })
    }
  })
}

module.exports = start
