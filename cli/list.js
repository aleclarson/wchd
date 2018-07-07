let log = require('lodge')
let wch = require('wch')

module.exports = function() {
  wch.on('offline', () => fatal('wchd is unreachable'))
  wch.connect()
  wch.list().then(roots => {
    if (roots.length) log(roots.join('\n'))
    process.exit()
  }).catch(fatal)
}
