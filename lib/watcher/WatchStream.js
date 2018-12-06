let {Readable} = require('readable-stream')
let wchQuery = require('wch/lib/query')
let nanoid = require('nanoid')
let noop = require('noop')
let path = require('path')
let cmd = require('./commands')

class WatchStream extends Readable {
  constructor(root, query) {
    if (query.crawl && query.since != null) {
      throw Error('Cannot define both `crawl` and `since` options')
    }
    super({
      read: noop, // Ignore backpressure.
      objectMode: true,
      destroy,
    })
    this.id = nanoid()
    this.path = root
    this.query = query
    this.clock = null
  }
  ready(fn) {
    return this.promise.then(fn)
  }
  catch(fn) {
    return this.promise.catch(fn)
  }
  _subscribe() {
    this.promise = cmd.watch(this.path).then(async (res) => {
      let query = wchQuery(this.query)
      query.relative_root = res.relative_path || ''

      // Crawl the directory.
      if (this.query.crawl && !this.crawled) {
        let q = await cmd.query(res.watch, query)
        q.files.forEach(file => {
          file.path = path.join(this.path, file.name)
          this.push(file)
        })

        // Stream changes after the query clock.
        query.since = this.clock = q.clock

        // Avoid crawling on reconnect.
        this.crawled = true
      }

      // Stream changes after now.
      else if (query.since == null) {
        query.since = Math.floor(Date.now() / 1000)
      }

      await cmd.subscribe(res.watch, this.id, query)
    })
    this.promise.catch(err => this.destroy(err))
    return this
  }
}

// 'readable-stream' does not emit "close" events by default.
function destroy(err, done) {
  done(err)
  process.nextTick(() => this.emit('close'))
}

module.exports = WatchStream
