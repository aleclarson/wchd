# wchd v0.10.2

**Extensible watcher daemon** (powered by [fb-watchman][1])

A single, resilient connection shared between all packages via the [wch][2] client.

[1]: https://www.npmjs.com/package/fb-watchman
[2]: https://www.npmjs.com/package/wch

```js
const wch = require('wchd');

// create a server
const server = wch(opts);

// watcher methods
wch.connect();
wch.watch(root, opts);
wch.unwatch(root);
wch.stream(dir, query);
wch.query(dir, query);
wch.list();
```

## CLI

- `wch start` start the daemon
- `wch stop` stop the daemon

#### Watching

- `wch .` watch current directory
- `wch -u .` unwatch current directory
- `wch ./foo` watch a relative directory
- `wch -u ./foo` unwatch a relative directory
- `wch . -f` watch current directory *temporarily*

The foreground (`-f`) watcher is lighter weight, because it only loads plugins that the current directory needs (instead of every plugin that every watched directory needs), and the API server isn't started.
