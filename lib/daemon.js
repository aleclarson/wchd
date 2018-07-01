let onWrite = require('on-write')
let slush = require('slush')
let log = require('lodge')
let fs = require('fsx')

let {
  LOG_PATH,
  SOCK_PATH,
} = require('../paths')

// Change our process name.
process.title = 'wch'

// Write to a log file.
let fd = fs.open(LOG_PATH, 'w+')
let write = (data) => fs.append(fd, data)
onWrite(process.stdout, write)
onWrite(process.stderr, write)

// Default behavior for unhandled process events.
require('unhandled')

// Override the `wch` package.
let Module = require('module')
let loadModule = Module._load
Module._load = function(req) {
  if (req == 'wch') return require('./client')
  return loadModule.apply(this, arguments)
}

// Clean up on exit.
process.on('exit', () => {
  fs.removeFile(SOCK_PATH, false)
})

// Connect to watchman.
let watcher = require('./watcher')
let starting = watcher.start('watched.json')
starting.catch(onError)

// Start the server.
slush({
  sock: SOCK_PATH,
})
.pipe(require('./api'))
.on('close', process.exit)
.on('error', onError)
.ready(() => {
  log(log.lgreen('Server ready!'))
  starting.then(() => {
    fs.touch(SOCK_PATH)
  }).catch(onError)
})

function onError(err) {
  console.error(err.stack)
  process.exit(1)
}
