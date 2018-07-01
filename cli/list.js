let log = require('lodge')
let wch = require('wch')

module.exports = function() {
  wch.list().then(roots => {
    if (roots.length) log(roots.join('\n'))
  }).catch(fatal)
}
