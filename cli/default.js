let slurm = require('slurm')
let path = require('path')
let wch = require('wch')

module.exports = async function() {
  let args = slurm({
    u: {list: true}, // unwatch
    x: {rest: true}, // exec
    f: true, // foreground
    v: true, // verbose
  })

  // first arg is "." or ".." or starts with "./" or "../"
  let relativeRE = /^\.\.?(\/[^ ]*)?( |$)/
  if (relativeRE.test(args._)) {
    // temporary watch
    if (args.f) {
      if (args.length > 1) {
        fatal('Cannot use -f on multiple roots')
      }
      let root = path.resolve(args[0])
      let {connect, watch} = require('..')
      return connect().then(async () => {
        await watch(root)
        good('Watching...')
      }).catch(fatal)
    }
    // exec and watch
    if (Array.isArray(args.x)) {
      if (args.length > 1) {
        fatal('Cannot use -x on multiple roots')
      }
      let root = path.resolve(args[0])
      return exec(root, args.x[0], args.x.slice(1))
    }
    // persistent watch
    for (let i = 0; i < args.length; i++) {
      let root = args[i]
      if (relativeRE.test(root)) {
        root = path.resolve(root)
        await wch(root).then(success => {
          if (success) good('Watching:', root)
          else warn('Already watching:', root)
        }).catch(fatal)
      }
    }
    if (!args.u) {
      return
    }
  }
  else if (!args._.startsWith('-u')) {
    fatal('Unrecognized command')
  }
  args.u.forEach(root => {
    root = path.resolve(root)
    wch.unwatch(root).then(success => {
      if (success) good('Unwatched:', root)
      else warn('Not watching:', root)
    }).catch(fatal)
  })
}

// Restart a child process when files change.
function exec(root, cmd, args) {
  let {spawn} = require('child_process')
  let log = require('lodge')

  let proc = run()
  let kill = debounce(100, () => {
    if (!proc) return rerun()
    proc.once('exit', rerun).kill()
  })

  wch.stream(root, {
    skip: [
      '.git/',
      '.*.sw[a-z]', '*~', // vim temporary files
      '.DS_Store',        // macOS Finder metadata
    ]
  }).on('data', kill)

  function run() {
    return spawn(cmd, args, {
      stdio: ['ignore', 'inherit', 'inherit']
    }).on('error', fatal).on('exit', die)
  }

  function die() {
    proc = null
  }

  function rerun() {
    if (!args.v) log.clear()
    proc = run()
  }

  function debounce(delay, fn) {
    let timer
    return function() {
      clearTimeout(timer)
      timer = setTimeout(fn, delay)
    }
  }
}
