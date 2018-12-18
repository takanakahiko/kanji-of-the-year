// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"script/sub_modules/util.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

exports.clamp = function (n, max, min) {
  if (typeof min !== 'number') min = 0;
  return n > max ? max : n < min ? min : n;
};

exports.random = function (max, min) {
  if (typeof max !== 'number') {
    return Math.random();
  } else if (typeof min !== 'number') {
    min = 0;
  }

  return Math.random() * (max - min) + min;
};

function getAdjustedPosition(x, y, target) {
  var rect = target.getBoundingClientRect();
  var xx = Math.round(target.width * (x - rect.left) / target.clientWidth);
  var yy = Math.round(target.height * (y - rect.top) / target.clientHeight);
  return [xx, yy];
}

exports.getAdjustedPosition = getAdjustedPosition;
},{}],"script/sub_modules/Brush.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var util_1 = require("./util");

var Brush =
/** @class */
function () {
  function Brush(size, amount, ctx) {
    this.size = size;
    this.amount = amount;
    this.ctx = ctx;
    this.hairs = [];
    this.isTouch = false;
  }

  Brush.prototype.down = function (x, y) {
    this.isTouch = true;
    var hairNum = this.size * 4;
    var rangeMax = this.size;

    for (var i = 0; i < hairNum; i++) {
      var range = util_1.random(rangeMax, 0);
      var dx = Math.sin(range) * range;
      var dy = Math.cos(range) * range;
      this.hairs[i] = new Hair(dx, dy, 3, this.amount * util_1.random(1, 0.5), this.ctx);
    }

    this.hairs.forEach(function (h) {
      return h.down(x, y);
    });
  };

  Brush.prototype.move = function (x, y) {
    if (this.isTouch) this.hairs.forEach(function (h) {
      return h.move(x, y);
    });
  };

  Brush.prototype.up = function () {
    this.isTouch = false;
  };

  return Brush;
}();

exports.Brush = Brush;

var Hair =
/** @class */
function () {
  function Hair(dx, dy, size, amount, ctx) {
    this.dx = dx;
    this.dy = dy;
    this.size = size;
    this.amount = amount;
    this.ctx = ctx;
    this.x = 0;
    this.y = 0;
  }

  Hair.prototype.down = function (parentX, parentY) {
    this.ctx.save();
    this.x = parentX + this.dx;
    this.y = parentY + this.dy;
    var hsla = new HSLA(1, 1, 1, 1);
    this.ctx.fillStyle = hsla.toString();
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    this.ctx.fill();
    this.ctx.restore();
  };

  Hair.prototype.move = function (parentX, parentY) {
    this.ctx.save();
    var _a = [this.x, this.y],
        oldX = _a[0],
        oldY = _a[1];
    this.x = parentX + this.dx;
    this.y = parentY + this.dy;
    var hsla = new HSLA(1, 1, 1, 1);
    var speed = Hair.distance(oldX, oldY, this.x, this.y);
    hsla.a = this.amount / speed;
    this.ctx.lineCap = 'round';
    this.line(oldX, oldY, this.x, this.y, hsla, this.size / 2);
    hsla.a = util_1.clamp((1 - speed / this.amount) * 0.3, 0.3, 0);
    this.ctx.lineCap = 'butt';
    this.line(oldX, oldY, this.x, this.y, hsla, this.size);
    this.ctx.restore();
  };

  Hair.prototype.line = function (oldX, oldY, newX, newY, hsla, width) {
    this.ctx.strokeStyle = hsla.toString();
    this.ctx.lineWidth = width;
    this.ctx.beginPath();
    this.ctx.moveTo(oldX, oldY);
    this.ctx.lineTo(newX, newY);
    this.ctx.stroke();
  };

  Hair.distance = function (x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  };

  return Hair;
}();

var HSLA =
/** @class */
function () {
  function HSLA(h, s, l, a) {
    this.h = h;
    this.s = s;
    this.l = l;
    this.a = a;
  }

  HSLA.prototype.toString = function () {
    return 'hsla(' + this.h + ', ' + this.s + '%, ' + this.l + '%, ' + this.a + ')';
  };

  return HSLA;
}();
},{"./util":"script/sub_modules/util.ts"}],"base.jpg":[function(require,module,exports) {
module.exports = "/base.72267ccd.jpg";
},{}],"script/Main.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var Brush_1 = require("./sub_modules/Brush");

var util_1 = require("./sub_modules/util");

var backgroundSrc = require('../base.jpg');

var start = function start() {
  var canvas = window.document.getElementById('canvas');
  var ctx = canvas.getContext("2d");
  var brush = new Brush_1.Brush(10, 15, ctx);
  canvas.addEventListener('mousedown', function (e) {
    var _a = util_1.getAdjustedPosition(e.clientX, e.clientY, canvas),
        x = _a[0],
        y = _a[1];

    brush.down(x, y);
  });
  canvas.addEventListener('mousemove', function (e) {
    var _a = util_1.getAdjustedPosition(e.clientX, e.clientY, canvas),
        x = _a[0],
        y = _a[1];

    brush.move(x, y);
  });
  canvas.addEventListener('mouseup', function (e) {
    brush.up();
  });
  canvas.addEventListener('mouseover', function (e) {
    brush.up();
  });
  canvas.addEventListener('touchstart', function (e) {
    var touchObject = e.touches[0];

    var _a = util_1.getAdjustedPosition(touchObject.pageX, touchObject.pageY, canvas),
        x = _a[0],
        y = _a[1];

    brush.down(x, y);
  });
  canvas.addEventListener('touchmove', function (e) {
    e.preventDefault();
    var touchObject = e.touches[0];

    var _a = util_1.getAdjustedPosition(touchObject.pageX, touchObject.pageY, canvas),
        x = _a[0],
        y = _a[1];

    brush.move(x, y);
  });
  canvas.addEventListener('touchend', function (e) {
    brush.up();
  });
};

var finish = function finish() {
  var canvas = window.document.getElementById('canvas');
  var ctx = canvas.getContext("2d");
  var drawData = canvas.toDataURL('image/png');
  var background = new Image();
  background.addEventListener('load', function () {
    ctx.drawImage(background, 0, 0, 650, canvas.height);
    var drawImg = new Image();
    drawImg.addEventListener('load', function () {
      ctx.translate(220, 60);
      ctx.transform(0.4, 0, -0.05, 0.6, 50, 50);
      ctx.rotate(5 * Math.PI / 180);
      ctx.drawImage(drawImg, 100, 0);
      var img = document.getElementById("ret");
      img.addEventListener('load', function () {
        canvas.style.display = 'none';
        img.style.display = 'inline-block';
        document.getElementById('end').style.display = 'none';
        document.getElementById('message').style.display = 'inline';
        document.getElementById('tweet_button').style.display = 'inline';
      });
      img.src = canvas.toDataURL('image/png');
      var imageBase64 = document.getElementById('imageBase64');
      imageBase64.value = canvas.toDataURL('image/png');
    });
    drawImg.src = drawData;
  });
  background.src = backgroundSrc;
};

var main = function main() {
  start();
  var button2 = window.document.getElementById('end');
  button2.addEventListener('click', function () {
    finish();
  });
};

window.addEventListener("DOMContentLoaded", main);
},{"./sub_modules/Brush":"script/sub_modules/Brush.ts","./sub_modules/util":"script/sub_modules/util.ts","../base.jpg":"base.jpg"}],"app.js":[function(require,module,exports) {
"use strict";

require("./script/Main.ts");
},{"./script/Main.ts":"script/Main.ts"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "62060" + '/');

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","app.js"], null)
//# sourceMappingURL=/app.c328ef1a.map