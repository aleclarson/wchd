let fs = require('fsx')

module.exports = function() {
  let {LOG_PATH} = require('../paths')
  if (fs.isFile(LOG_PATH)) {
    fs.read(LOG_PATH).pipe(process.stdout)
  }
}
