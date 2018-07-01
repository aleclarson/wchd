
// Override the `wch` package.
let Module = require('module')
let loadModule = Module._load
Module._load = function(req) {
  if (req == 'wch') return require('./client')
  return loadModule.apply(this, arguments)
}

function wch(opts) {
  return require('slush')(opts)
    .pipe(require('./api'))
}

let _ = require('./watcher')

wch.connect = () => _.start()
wch.watch = _.watch
wch.unwatch = _.unwatch
wch.stream = _.stream
wch.query = _.query
wch.list = _.list

module.exports = wch
