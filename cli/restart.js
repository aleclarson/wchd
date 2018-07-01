
function restart() {
  require('./stop')()
    .then(require('./start'))
}

module.exports = restart
