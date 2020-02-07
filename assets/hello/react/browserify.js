var require = function(file, cwd) {
    let resolved = require.resolve(file, cwd || '/');
    let mod = require.modules[resolved];
    if (!mod) {
        throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    }
    let res = mod._cached ? mod._cached : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.extensions = ['.js', '.coffee'];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true,
};

require.resolve = (function() {
    return function(x, cwd) {
        if (!cwd) cwd = '/';

        if (require._core[x]) return x;
        let path = require.modules.path();
        cwd = path.resolve('/', cwd);
        let y = cwd || '/';

        if (x.match(/^(?:\.\.?\/|\/)/)) {
            let m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }

        let n = loadNodeModulesSync(x, y);
        if (n) return n;

        throw new Error('Cannot find module \'' + x + '\'');

        function loadAsFileSync(x) {
            if (require.modules[x]) {
                return x;
            }

            for (let i = 0; i < require.extensions.length; i++) {
                let ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }

        function loadAsDirectorySync(x) {
            x = x.replace(/\/+$/, '');
            let pkgfile = x + '/package.json';
            if (require.modules[pkgfile]) {
                let pkg = require.modules[pkgfile]();
                let b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                } else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                } else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }

            return loadAsFileSync(x + '/index');
        }

        function loadNodeModulesSync(x, start) {
            let dirs = nodeModulesPathsSync(start);
            for (let i = 0; i < dirs.length; i++) {
                let dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                let n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }

            var m = loadAsFileSync(x);
            if (m) return m;
        }

        function nodeModulesPathsSync(start) {
            let parts;
            if (start === '/') parts = [''];
            else parts = path.normalize(start).split('/');

            let dirs = [];
            for (let i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                let dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }

            return dirs;
        }
    };
})();

require.alias = function(from, to) {
    let path = require.modules.path();
    let res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    } catch (err) {
        res = require.resolve(from, '/');
    }
    let basedir = path.dirname(res);

    let keys = (Object.keys || function(obj) {
        let res = [];
        for (let key in obj) res.push(key);
        return res;
    })(require.modules);

    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            let f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        } else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

require.define = function(filename, fn) {
    let dirname = require._core[filename]
        ? ''
        : require.modules.path().dirname(filename)
    ;

    let require_ = function(file) {
        return require(file, dirname);
    };
    require_.resolve = function(name) {
        return require.resolve(name, dirname);
    };
    require_.modules = require.modules;
    require_.define = require.define;
    let module_ = {exports: {}};

    require.modules[filename] = function() {
        require.modules[filename]._cached = module_.exports;
        fn.call(
            module_.exports,
            require_,
            module_,
            module_.exports,
            dirname,
            filename
        );
        require.modules[filename]._cached = module_.exports;
        return module_.exports;
    };
};

if (typeof process === 'undefined') process = {};

if (!process.nextTick) {
    process.nextTick = (function() {
        let queue = [];
        let canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;

        if (canPost) {
            window.addEventListener('message', function(ev) {
                if (ev.source === window && ev.data === 'browserify-tick') {
                    ev.stopPropagation();
                    if (queue.length > 0) {
                        let fn = queue.shift();
                        fn();
                    }
                }
            }, true);
        }

        return function(fn) {
            if (canPost) {
                queue.push(fn);
                window.postMessage('browserify-tick', '*');
            } else setTimeout(fn, 0);
        };
    })();
}

if (!process.title) process.title = 'browser';

if (!process.binding) {
    process.binding = function(name) {
        if (name === 'evals') return require('vm');
        else throw new Error('No such module');
    };
}

if (!process.cwd) {
    process.cwd = function() {
        return '.';
    };
}

if (!process.env) process.env = {};
if (!process.argv) process.argv = [];

require.define('path', Function(
    ['require', 'module', 'exports', '__dirname', '__filename'],
    'function filter (xs, fn) {\n    var res = [];\n    for (var i = 0; i < xs.length; i++) {\n        if (fn(xs[i], i, xs)) res.push(xs[i]);\n    }\n    return res;\n}\n\n// resolves . and .. elements in a path array with directory names there\n// must be no slashes, empty elements, or device names (c:\\) in the array\n// (so also no leading and trailing slashes - it does not distinguish\n// relative and absolute paths)\nfunction normalizeArray(parts, allowAboveRoot) {\n  // if the path tries to go above the root, `up` ends up > 0\n  var up = 0;\n  for (var i = parts.length; i >= 0; i--) {\n    var last = parts[i];\n    if (last == \'.\') {\n      parts.splice(i, 1);\n    } else if (last === \'..\') {\n      parts.splice(i, 1);\n      up++;\n    } else if (up) {\n      parts.splice(i, 1);\n      up--;\n    }\n  }\n\n  // if the path is allowed to go above the root, restore leading ..s\n  if (allowAboveRoot) {\n    for (; up--; up) {\n      parts.unshift(\'..\');\n    }\n  }\n\n  return parts;\n}\n\n// Regex to split a filename into [*, dir, basename, ext]\n// posix version\nvar splitPathRe = /^(.+\\/(?!$)|\\/)?((?:.+?)?(\\.[^.]*)?)$/;\n\n// path.resolve([from ...], to)\n// posix version\nexports.resolve = function() {\nvar resolvedPath = \'\',\n    resolvedAbsolute = false;\n\nfor (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {\n  var path = (i >= 0)\n      ? arguments[i]\n      : process.cwd();\n\n  // Skip empty and invalid entries\n  if (typeof path !== \'string\' || !path) {\n    continue;\n  }\n\n  resolvedPath = path + \'/\' + resolvedPath;\n  resolvedAbsolute = path.charAt(0) === \'/\';\n}\n\n// At this point the path should be resolved to a full absolute path, but\n// handle relative paths to be safe (might happen when process.cwd() fails)\n\n// Normalize the path\nresolvedPath = normalizeArray(filter(resolvedPath.split(\'/\'), function(p) {\n    return !!p;\n  }), !resolvedAbsolute).join(\'/\');\n\n  return ((resolvedAbsolute ? \'/\' : \'\') + resolvedPath) || \'.\';\n};\n\n// path.normalize(path)\n// posix version\nexports.normalize = function(path) {\nvar isAbsolute = path.charAt(0) === \'/\',\n    trailingSlash = path.slice(-1) === \'/\';\n\n// Normalize the path\npath = normalizeArray(filter(path.split(\'/\'), function(p) {\n    return !!p;\n  }), !isAbsolute).join(\'/\');\n\n  if (!path && !isAbsolute) {\n    path = \'.\';\n  }\n  if (path && trailingSlash) {\n    path += \'/\';\n  }\n  \n  return (isAbsolute ? \'/\' : \'\') + path;\n};\n\n\n// posix version\nexports.join = function() {\n  var paths = Array.prototype.slice.call(arguments, 0);\n  return exports.normalize(filter(paths, function(p, index) {\n    return p && typeof p === \'string\';\n  }).join(\'/\'));\n};\n\n\nexports.dirname = function(path) {\n  var dir = splitPathRe.exec(path)[1] || \'\';\n  var isWindows = false;\n  if (!dir) {\n    // No dirname\n    return \'.\';\n  } else if (dir.length === 1 ||\n      (isWindows && dir.length <= 3 && dir.charAt(1) === \':\')) {\n    // It is just a slash or a drive letter with a slash\n    return dir;\n  } else {\n    // It is a full dirname, strip trailing slash\n    return dir.substring(0, dir.length - 1);\n  }\n};\n\n\nexports.basename = function(path, ext) {\n  var f = splitPathRe.exec(path)[2] || \'\';\n  // TODO: make this comparison case-insensitive on windows?\n  if (ext && f.substr(-1 * ext.length) === ext) {\n    f = f.substr(0, f.length - ext.length);\n  }\n  return f;\n};\n\n\nexports.extname = function(path) {\n  return splitPathRe.exec(path)[3] || \'\';\n};\n\n//@ sourceURL=path'
));

require.define('timers', Function(
    ['require', 'module', 'exports', '__dirname', '__filename'],
    'module.exports = require("timers-browserify")\n//@ sourceURL=timers'
));

require.define('/node_modules/timers-browserify/package.json', Function(
    ['require', 'module', 'exports', '__dirname', '__filename'],
    'module.exports = {"main":"main.js"}\n//@ sourceURL=/node_modules/timers-browserify/package.json'
));

require.define('/node_modules/timers-browserify/main.js', Function(
    ['require', 'module', 'exports', '__dirname', '__filename'],
    '// DOM APIs, for completeness\n\nexports.setTimeout = setTimeout;\nexports.clearTimeout = clearTimeout;\nexports.setInterval = setInterval;\nexports.clearInterval = clearInterval;\n\n// TODO: Change to more effiecient list approach used in Node.js\n// For now, we just implement the APIs using the primitives above.\n\nexports.enroll = function(item, delay) {\n  item._timeoutID = setTimeout(item._onTimeout, delay);\n};\n\nexports.unenroll = function(item) {\n  clearTimeout(item._timeoutID);\n};\n\nexports.active = function(item) {\n  // our naive impl doesn\'t care (correctness is still preserved)\n};\n\n//@ sourceURL=/node_modules/timers-browserify/main.js'
));

require.define('/main.js', Function(
    ['require', 'module', 'exports', '__dirname', '__filename'],
    'var timers = require(\'timers\');\n\nvar obj = {\n  _onTimeout: function() {\n    console.log(\'Timer ran for: \' + (new Date().getTime() - obj.now) + \' ms\');\n  },\n  start: function() {\n    console.log(\'Timer should run for 100 ms\');\n    this.now = new Date().getTime();\n    timers.enroll(this, 100);\n  }\n};\n\nobj.start();\n\n//@ sourceURL=/main.js'
));
require('/main.js');
