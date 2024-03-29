// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (modules, entry, mainEntry, parcelRequireName, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
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

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        this
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
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
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"jlseL":[function(require,module,exports) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SECURE = false;
var HMR_ENV_HASH = "d6ea1d42532a7575";
var HMR_USE_SSE = false;
module.bundle.HMR_BUNDLE_ID = "52c68b199f02a213";
"use strict";
/* global HMR_HOST, HMR_PORT, HMR_ENV_HASH, HMR_SECURE, HMR_USE_SSE, chrome, browser, __parcel__import__, __parcel__importScripts__, ServiceWorkerGlobalScope */ /*::
import type {
  HMRAsset,
  HMRMessage,
} from '@parcel/reporter-dev-server/src/HMRServer.js';
interface ParcelRequire {
  (string): mixed;
  cache: {|[string]: ParcelModule|};
  hotData: {|[string]: mixed|};
  Module: any;
  parent: ?ParcelRequire;
  isParcelRequire: true;
  modules: {|[string]: [Function, {|[string]: string|}]|};
  HMR_BUNDLE_ID: string;
  root: ParcelRequire;
}
interface ParcelModule {
  hot: {|
    data: mixed,
    accept(cb: (Function) => void): void,
    dispose(cb: (mixed) => void): void,
    // accept(deps: Array<string> | string, cb: (Function) => void): void,
    // decline(): void,
    _acceptCallbacks: Array<(Function) => void>,
    _disposeCallbacks: Array<(mixed) => void>,
  |};
}
interface ExtensionContext {
  runtime: {|
    reload(): void,
    getURL(url: string): string;
    getManifest(): {manifest_version: number, ...};
  |};
}
declare var module: {bundle: ParcelRequire, ...};
declare var HMR_HOST: string;
declare var HMR_PORT: string;
declare var HMR_ENV_HASH: string;
declare var HMR_SECURE: boolean;
declare var HMR_USE_SSE: boolean;
declare var chrome: ExtensionContext;
declare var browser: ExtensionContext;
declare var __parcel__import__: (string) => Promise<void>;
declare var __parcel__importScripts__: (string) => Promise<void>;
declare var globalThis: typeof self;
declare var ServiceWorkerGlobalScope: Object;
*/ var OVERLAY_ID = "__parcel__error__overlay__";
var OldModule = module.bundle.Module;
function Module(moduleName) {
    OldModule.call(this, moduleName);
    this.hot = {
        data: module.bundle.hotData[moduleName],
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function(fn) {
            this._acceptCallbacks.push(fn || function() {});
        },
        dispose: function(fn) {
            this._disposeCallbacks.push(fn);
        }
    };
    module.bundle.hotData[moduleName] = undefined;
}
module.bundle.Module = Module;
module.bundle.hotData = {};
var checkedAssets /*: {|[string]: boolean|} */ , assetsToDispose /*: Array<[ParcelRequire, string]> */ , assetsToAccept /*: Array<[ParcelRequire, string]> */ ;
function getHostname() {
    return HMR_HOST || (location.protocol.indexOf("http") === 0 ? location.hostname : "localhost");
}
function getPort() {
    return HMR_PORT || location.port;
}
// eslint-disable-next-line no-redeclare
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== "undefined") {
    var hostname = getHostname();
    var port = getPort();
    var protocol = HMR_SECURE || location.protocol == "https:" && ![
        "localhost",
        "127.0.0.1",
        "0.0.0.0"
    ].includes(hostname) ? "wss" : "ws";
    var ws;
    if (HMR_USE_SSE) ws = new EventSource("/__parcel_hmr");
    else try {
        ws = new WebSocket(protocol + "://" + hostname + (port ? ":" + port : "") + "/");
    } catch (err) {
        if (err.message) console.error(err.message);
        ws = {};
    }
    // Web extension context
    var extCtx = typeof browser === "undefined" ? typeof chrome === "undefined" ? null : chrome : browser;
    // Safari doesn't support sourceURL in error stacks.
    // eval may also be disabled via CSP, so do a quick check.
    var supportsSourceURL = false;
    try {
        (0, eval)('throw new Error("test"); //# sourceURL=test.js');
    } catch (err) {
        supportsSourceURL = err.stack.includes("test.js");
    }
    // $FlowFixMe
    ws.onmessage = async function(event /*: {data: string, ...} */ ) {
        checkedAssets = {} /*: {|[string]: boolean|} */ ;
        assetsToAccept = [];
        assetsToDispose = [];
        var data /*: HMRMessage */  = JSON.parse(event.data);
        if (data.type === "update") {
            // Remove error overlay if there is one
            if (typeof document !== "undefined") removeErrorOverlay();
            let assets = data.assets.filter((asset)=>asset.envHash === HMR_ENV_HASH);
            // Handle HMR Update
            let handled = assets.every((asset)=>{
                return asset.type === "css" || asset.type === "js" && hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle);
            });
            if (handled) {
                console.clear();
                // Dispatch custom event so other runtimes (e.g React Refresh) are aware.
                if (typeof window !== "undefined" && typeof CustomEvent !== "undefined") window.dispatchEvent(new CustomEvent("parcelhmraccept"));
                await hmrApplyUpdates(assets);
                // Dispose all old assets.
                let processedAssets = {} /*: {|[string]: boolean|} */ ;
                for(let i = 0; i < assetsToDispose.length; i++){
                    let id = assetsToDispose[i][1];
                    if (!processedAssets[id]) {
                        hmrDispose(assetsToDispose[i][0], id);
                        processedAssets[id] = true;
                    }
                }
                // Run accept callbacks. This will also re-execute other disposed assets in topological order.
                processedAssets = {};
                for(let i = 0; i < assetsToAccept.length; i++){
                    let id = assetsToAccept[i][1];
                    if (!processedAssets[id]) {
                        hmrAccept(assetsToAccept[i][0], id);
                        processedAssets[id] = true;
                    }
                }
            } else fullReload();
        }
        if (data.type === "error") {
            // Log parcel errors to console
            for (let ansiDiagnostic of data.diagnostics.ansi){
                let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
                console.error("\uD83D\uDEA8 [parcel]: " + ansiDiagnostic.message + "\n" + stack + "\n\n" + ansiDiagnostic.hints.join("\n"));
            }
            if (typeof document !== "undefined") {
                // Render the fancy html overlay
                removeErrorOverlay();
                var overlay = createErrorOverlay(data.diagnostics.html);
                // $FlowFixMe
                document.body.appendChild(overlay);
            }
        }
    };
    if (ws instanceof WebSocket) {
        ws.onerror = function(e) {
            if (e.message) console.error(e.message);
        };
        ws.onclose = function() {
            console.warn("[parcel] \uD83D\uDEA8 Connection to the HMR server was lost");
        };
    }
}
function removeErrorOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.remove();
        console.log("[parcel] \u2728 Error resolved");
    }
}
function createErrorOverlay(diagnostics) {
    var overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
    for (let diagnostic of diagnostics){
        let stack = diagnostic.frames.length ? diagnostic.frames.reduce((p, frame)=>{
            return `${p}
<a href="/__parcel_launch_editor?file=${encodeURIComponent(frame.location)}" style="text-decoration: underline; color: #888" onclick="fetch(this.href); return false">${frame.location}</a>
${frame.code}`;
        }, "") : diagnostic.stack;
        errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          \u{1F6A8} ${diagnostic.message}
        </div>
        <pre>${stack}</pre>
        <div>
          ${diagnostic.hints.map((hint)=>"<div>\uD83D\uDCA1 " + hint + "</div>").join("")}
        </div>
        ${diagnostic.documentation ? `<div>\u{1F4DD} <a style="color: violet" href="${diagnostic.documentation}" target="_blank">Learn more</a></div>` : ""}
      </div>
    `;
    }
    errorHTML += "</div>";
    overlay.innerHTML = errorHTML;
    return overlay;
}
function fullReload() {
    if ("reload" in location) location.reload();
    else if (extCtx && extCtx.runtime && extCtx.runtime.reload) extCtx.runtime.reload();
}
function getParents(bundle, id) /*: Array<[ParcelRequire, string]> */ {
    var modules = bundle.modules;
    if (!modules) return [];
    var parents = [];
    var k, d, dep;
    for(k in modules)for(d in modules[k][1]){
        dep = modules[k][1][d];
        if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) parents.push([
            bundle,
            k
        ]);
    }
    if (bundle.parent) parents = parents.concat(getParents(bundle.parent, id));
    return parents;
}
function updateLink(link) {
    var href = link.getAttribute("href");
    if (!href) return;
    var newLink = link.cloneNode();
    newLink.onload = function() {
        if (link.parentNode !== null) // $FlowFixMe
        link.parentNode.removeChild(link);
    };
    newLink.setAttribute("href", // $FlowFixMe
    href.split("?")[0] + "?" + Date.now());
    // $FlowFixMe
    link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
    if (cssTimeout) return;
    cssTimeout = setTimeout(function() {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for(var i = 0; i < links.length; i++){
            // $FlowFixMe[incompatible-type]
            var href /*: string */  = links[i].getAttribute("href");
            var hostname = getHostname();
            var servedFromHMRServer = hostname === "localhost" ? new RegExp("^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):" + getPort()).test(href) : href.indexOf(hostname + ":" + getPort());
            var absolute = /^https?:\/\//i.test(href) && href.indexOf(location.origin) !== 0 && !servedFromHMRServer;
            if (!absolute) updateLink(links[i]);
        }
        cssTimeout = null;
    }, 50);
}
function hmrDownload(asset) {
    if (asset.type === "js") {
        if (typeof document !== "undefined") {
            let script = document.createElement("script");
            script.src = asset.url + "?t=" + Date.now();
            if (asset.outputFormat === "esmodule") script.type = "module";
            return new Promise((resolve, reject)=>{
                var _document$head;
                script.onload = ()=>resolve(script);
                script.onerror = reject;
                (_document$head = document.head) === null || _document$head === void 0 || _document$head.appendChild(script);
            });
        } else if (typeof importScripts === "function") {
            // Worker scripts
            if (asset.outputFormat === "esmodule") return import(asset.url + "?t=" + Date.now());
            else return new Promise((resolve, reject)=>{
                try {
                    importScripts(asset.url + "?t=" + Date.now());
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    }
}
async function hmrApplyUpdates(assets) {
    global.parcelHotUpdate = Object.create(null);
    let scriptsToRemove;
    try {
        // If sourceURL comments aren't supported in eval, we need to load
        // the update from the dev server over HTTP so that stack traces
        // are correct in errors/logs. This is much slower than eval, so
        // we only do it if needed (currently just Safari).
        // https://bugs.webkit.org/show_bug.cgi?id=137297
        // This path is also taken if a CSP disallows eval.
        if (!supportsSourceURL) {
            let promises = assets.map((asset)=>{
                var _hmrDownload;
                return (_hmrDownload = hmrDownload(asset)) === null || _hmrDownload === void 0 ? void 0 : _hmrDownload.catch((err)=>{
                    // Web extension fix
                    if (extCtx && extCtx.runtime && extCtx.runtime.getManifest().manifest_version == 3 && typeof ServiceWorkerGlobalScope != "undefined" && global instanceof ServiceWorkerGlobalScope) {
                        extCtx.runtime.reload();
                        return;
                    }
                    throw err;
                });
            });
            scriptsToRemove = await Promise.all(promises);
        }
        assets.forEach(function(asset) {
            hmrApply(module.bundle.root, asset);
        });
    } finally{
        delete global.parcelHotUpdate;
        if (scriptsToRemove) scriptsToRemove.forEach((script)=>{
            if (script) {
                var _document$head2;
                (_document$head2 = document.head) === null || _document$head2 === void 0 || _document$head2.removeChild(script);
            }
        });
    }
}
function hmrApply(bundle /*: ParcelRequire */ , asset /*:  HMRAsset */ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (asset.type === "css") reloadCSS();
    else if (asset.type === "js") {
        let deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
        if (deps) {
            if (modules[asset.id]) {
                // Remove dependencies that are removed and will become orphaned.
                // This is necessary so that if the asset is added back again, the cache is gone, and we prevent a full page reload.
                let oldDeps = modules[asset.id][1];
                for(let dep in oldDeps)if (!deps[dep] || deps[dep] !== oldDeps[dep]) {
                    let id = oldDeps[dep];
                    let parents = getParents(module.bundle.root, id);
                    if (parents.length === 1) hmrDelete(module.bundle.root, id);
                }
            }
            if (supportsSourceURL) // Global eval. We would use `new Function` here but browser
            // support for source maps is better with eval.
            (0, eval)(asset.output);
            // $FlowFixMe
            let fn = global.parcelHotUpdate[asset.id];
            modules[asset.id] = [
                fn,
                deps
            ];
        } else if (bundle.parent) hmrApply(bundle.parent, asset);
    }
}
function hmrDelete(bundle, id) {
    let modules = bundle.modules;
    if (!modules) return;
    if (modules[id]) {
        // Collect dependencies that will become orphaned when this module is deleted.
        let deps = modules[id][1];
        let orphans = [];
        for(let dep in deps){
            let parents = getParents(module.bundle.root, deps[dep]);
            if (parents.length === 1) orphans.push(deps[dep]);
        }
        // Delete the module. This must be done before deleting dependencies in case of circular dependencies.
        delete modules[id];
        delete bundle.cache[id];
        // Now delete the orphans.
        orphans.forEach((id)=>{
            hmrDelete(module.bundle.root, id);
        });
    } else if (bundle.parent) hmrDelete(bundle.parent, id);
}
function hmrAcceptCheck(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    if (hmrAcceptCheckOne(bundle, id, depsByBundle)) return true;
    // Traverse parents breadth first. All possible ancestries must accept the HMR update, or we'll reload.
    let parents = getParents(module.bundle.root, id);
    let accepted = false;
    while(parents.length > 0){
        let v = parents.shift();
        let a = hmrAcceptCheckOne(v[0], v[1], null);
        if (a) // If this parent accepts, stop traversing upward, but still consider siblings.
        accepted = true;
        else {
            // Otherwise, queue the parents in the next level upward.
            let p = getParents(module.bundle.root, v[1]);
            if (p.length === 0) {
                // If there are no parents, then we've reached an entry without accepting. Reload.
                accepted = false;
                break;
            }
            parents.push(...p);
        }
    }
    return accepted;
}
function hmrAcceptCheckOne(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
        // If we reached the root bundle without finding where the asset should go,
        // there's nothing to do. Mark as "accepted" so we don't reload the page.
        if (!bundle.parent) return true;
        return hmrAcceptCheck(bundle.parent, id, depsByBundle);
    }
    if (checkedAssets[id]) return true;
    checkedAssets[id] = true;
    var cached = bundle.cache[id];
    assetsToDispose.push([
        bundle,
        id
    ]);
    if (!cached || cached.hot && cached.hot._acceptCallbacks.length) {
        assetsToAccept.push([
            bundle,
            id
        ]);
        return true;
    }
}
function hmrDispose(bundle /*: ParcelRequire */ , id /*: string */ ) {
    var cached = bundle.cache[id];
    bundle.hotData[id] = {};
    if (cached && cached.hot) cached.hot.data = bundle.hotData[id];
    if (cached && cached.hot && cached.hot._disposeCallbacks.length) cached.hot._disposeCallbacks.forEach(function(cb) {
        cb(bundle.hotData[id]);
    });
    delete bundle.cache[id];
}
function hmrAccept(bundle /*: ParcelRequire */ , id /*: string */ ) {
    // Execute the module.
    bundle(id);
    // Run the accept callbacks in the new version of the module.
    var cached = bundle.cache[id];
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) cached.hot._acceptCallbacks.forEach(function(cb) {
        var assetsToAlsoAccept = cb(function() {
            return getParents(module.bundle.root, id);
        });
        if (assetsToAlsoAccept && assetsToAccept.length) {
            assetsToAlsoAccept.forEach(function(a) {
                hmrDispose(a[0], a[1]);
            });
            // $FlowFixMe[method-unbinding]
            assetsToAccept.push.apply(assetsToAccept, assetsToAlsoAccept);
        }
    });
}

},{}],"lqflI":[function(require,module,exports) {
/*
 * Simple Digital Clock Widget
 * This is a simple digital clock widget that displays the current time and date in a specified time zone.
 * It is based on the utctime.info website.
 * http://utctime.info/
 * Version: 0.5.5
 */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
var _preact = require("preact");
var _preactCustomElement = require("preact-custom-element");
var _preactCustomElementDefault = parcelHelpers.interopDefault(_preactCustomElement);
var _clsx = require("clsx");
var _clsxDefault = parcelHelpers.interopDefault(_clsx);
var _stylesCss = require("bundle-text:./styles.css");
var _stylesCssDefault = parcelHelpers.interopDefault(_stylesCss);
var _contrastColor = require("./contrastColor");
var _contrastColorDefault = parcelHelpers.interopDefault(_contrastColor);
var _darkenColor = require("./darkenColor");
var _darkenColorDefault = parcelHelpers.interopDefault(_darkenColor);
var _dataYaml = require("./data.yaml");
var _dataYamlDefault = parcelHelpers.interopDefault(_dataYaml);
var _isDark = require("./isDark");
var _isDarkDefault = parcelHelpers.interopDefault(_isDark);
const v = "0.5.5";
const googleFontsMonospace = (0, _dataYamlDefault.default).allowFonts;
class SimpleDigitalClockWidget extends (0, _preact.Component) {
    constructor(props){
        super(props);
        this.containerRef = null;
        this.zoneContainerRef = null;
        this.dateContainerRef = null;
        this.loadGoogleFont = (fontFamily)=>{
            if (fontFamily) {
                const link = document.createElement("link");
                link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s/g, "+")}:wght@700&display=swap`;
                link.rel = "stylesheet";
                document.head.appendChild(link);
            }
        };
        this.handlePrefers = ()=>{
            const backgroundColor = this.props.prefers === undefined || this.props.prefers === null || this.props.prefers === "" || this.props.prefers === "system" || this.props.prefers === "auto" ? (0, _isDarkDefault.default)() ? "#000000" : "#ffffff" : this.props.prefers === "dark" ? "#000000" : "#ffffff";
            this.setState({
                backgroundColor
            });
            console.log(this.props.prefers, "prefers");
        };
        this.handleResize = ()=>{
            if (this.containerRef) {
                const localeList = [
                    "bg",
                    "ko"
                ];
                const currentLocale = this.props.locale || "en"; // Replace this with your actual locale string
                const isLocaleMatch = localeList.some((prefix)=>currentLocale.startsWith(prefix));
                const fontSizeByLocale = isLocaleMatch ? 8 : 7;
                const width = this.containerRef.offsetWidth;
                const fontSize = (width || 1) / fontSizeByLocale;
                const fontSizeTitle = (width || 1) / 15;
                this.setState({
                    fontSize,
                    fontSizeTitle
                });
            }
        };
        /**
   * Updates the time and date strings based on the current locale, timeZone, seconds, and period props.
   * Sets the state with the updated timeString, dateString, timeZoneName, and isError values.
   */ this.updateTimeAndDateString = ()=>{
            const { locale, timeZone, second, period } = this.props;
            const date = new Date();
            let isDay = true;
            let timeString = "";
            let dateString = "";
            let timeZoneName = "";
            let isError = false;
            console.log(period !== undefined && {
                hour12: true
            });
            const currentHour = date.getHours();
            isDay = currentHour >= 6 && currentHour < 18;
            try {
                timeString = date.toLocaleTimeString(locale, {
                    timeZone,
                    hour: "numeric",
                    minute: "numeric",
                    ...second !== undefined ? {
                        second: "numeric"
                    } : {},
                    ...period !== undefined ? {
                        hour12: true
                    } : {} // Add 'hour12' only if 'period' is defined
                });
                dateString = date.toLocaleDateString(locale, {
                    timeZone,
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                });
                timeZoneName = date.toLocaleDateString(locale, {
                    timeZone,
                    timeZoneName: this.props.timeZoneName === "" ? undefined : this.props.timeZoneName
                });
            } catch (e) {
                isError = true;
                console.error("Error: ", e);
            }
            this.setState({
                timeString,
                dateString,
                timeZoneName,
                isDay,
                isError
            });
        };
        this.interval;
        this.state = {
            isDay: true,
            isError: false,
            timeString: "",
            dateString: "",
            timeZoneName: "",
            fontSize: 16,
            fontSizeTitle: 16,
            backgroundColor: "#ffffff"
        };
    }
    // componentDidMount replaces useEffect for post-mount actions
    componentDidMount() {
        // console.log("componentDidMount");
        // Your CSS injection logic here
        this.handlePrefers();
        this.updateTimeAndDateString(); // Call it once immediately
        this.interval = setInterval(this.updateTimeAndDateString, 1000); // Call it every second
        window.addEventListener("resize", this.handleResize);
        this.handleResize();
        // Load the Google Font
        this.loadGoogleFont(this.props.fontFamily);
    }
    componentDidUpdate(prevProps) {
        // If fontFamily has changed, load the new one
        if (prevProps.fontFamily !== this.props.fontFamily) this.loadGoogleFont(this.props.fontFamily);
        if (prevProps.width !== this.props.width) this.handleResize();
        if (prevProps.prefers !== this.props.prefers) this.handlePrefers();
    }
    componentWillUnmount() {
        // console.log("componentWillUnmount");
        clearInterval(this.interval);
    }
    render() {
        const { backgroundColor, background, fontFamily, caption, rounded, shadow, border, width, align, date } = this.props;
        const showDate = date !== undefined;
        const showCaption = caption || false;
        const mainDivClasses = [
            "widget",
            "font-family"
        ];
        if (shadow) mainDivClasses.push(shadow);
        const mainStyle = {
            color: (0, _contrastColorDefault.default)(backgroundColor?.toLowerCase() || this.state.backgroundColor),
            ...background ? {
                background: background?.toLowerCase() || this.state.backgroundColor
            } : {
                backgroundColor: backgroundColor?.toLowerCase()
            }
        };
        const fontStyles = {
            fontFamily: googleFontsMonospace.some((element)=>element === fontFamily) ? this.props.fontFamily : "monospace"
        };
        return /*#__PURE__*/ (0, _preact.h)((0, _preact.Fragment), {
            __source: {
                fileName: "src/SimpleDigitalClockWidget.tsx",
                lineNumber: 248,
                columnNumber: 7
            },
            __self: this
        }, /*#__PURE__*/ (0, _preact.h)("style", {
            __source: {
                fileName: "src/SimpleDigitalClockWidget.tsx",
                lineNumber: 249,
                columnNumber: 9
            },
            __self: this
        }, (0, _stylesCssDefault.default)), /*#__PURE__*/ (0, _preact.h)("div", {
            "data-version": v,
            className: (0, _clsxDefault.default)(mainDivClasses),
            ref: (el)=>this.containerRef = el,
            style: {
                ...mainStyle,
                ...rounded !== undefined && {
                    borderRadius: `${rounded}rem`
                },
                ...border !== undefined && {
                    borderColor: (0, _darkenColorDefault.default)(backgroundColor?.toLowerCase() || this.state.backgroundColor, -0.25),
                    borderWidth: "1px"
                },
                transition: "background 1s ease",
                position: "relative",
                minWidth: 80,
                ...width !== undefined && {
                    width: parseInt(width?.toString() || "80", 10) || undefined
                }
            },
            __source: {
                fileName: "src/SimpleDigitalClockWidget.tsx",
                lineNumber: 250,
                columnNumber: 9
            },
            __self: this
        }, /*#__PURE__*/ (0, _preact.h)("div", {
            className: (0, _clsxDefault.default)(`text-${align || "center"}`),
            __source: {
                fileName: "src/SimpleDigitalClockWidget.tsx",
                lineNumber: 272,
                columnNumber: 11
            },
            __self: this
        }, this.state.timeString ? /*#__PURE__*/ (0, _preact.h)((0, _preact.Fragment), {
            __source: {
                fileName: "src/SimpleDigitalClockWidget.tsx",
                lineNumber: 274,
                columnNumber: 15
            },
            __self: this
        }, showCaption && /*#__PURE__*/ (0, _preact.h)("div", {
            style: {
                fontSize: this.state.fontSizeTitle
            },
            __source: {
                fileName: "src/SimpleDigitalClockWidget.tsx",
                lineNumber: 275,
                columnNumber: 33
            },
            __self: this
        }, caption), /*#__PURE__*/ (0, _preact.h)("a", {
            title: this.state.timeZoneName,
            style: {
                fontSize: this.state.fontSize,
                ...fontStyles
            },
            href: "https://utctime.info/",
            target: "_blank",
            rel: "noopener noreferrer",
            __source: {
                fileName: "src/SimpleDigitalClockWidget.tsx",
                lineNumber: 276,
                columnNumber: 17
            },
            __self: this
        }, this.state.timeString), showDate && /*#__PURE__*/ (0, _preact.h)((0, _preact.Fragment), {
            __source: {
                fileName: "src/SimpleDigitalClockWidget.tsx",
                lineNumber: 286,
                columnNumber: 19
            },
            __self: this
        }, /*#__PURE__*/ (0, _preact.h)("div", {
            title: this.state.timeZoneName,
            ref: (el)=>this.dateContainerRef = el,
            onClick: ()=>{
                this.zoneContainerRef?.style.setProperty("display", "block");
                this.dateContainerRef?.style.setProperty("display", "none");
            },
            style: {
                fontSize: this.state.fontSizeTitle,
                cursor: "pointer"
            },
            __source: {
                fileName: "src/SimpleDigitalClockWidget.tsx",
                lineNumber: 287,
                columnNumber: 21
            },
            __self: this
        }, this.state.dateString), /*#__PURE__*/ (0, _preact.h)("div", {
            title: this.state.dateString,
            onClick: ()=>{
                this.zoneContainerRef?.style.setProperty("display", "none");
                this.dateContainerRef?.style.setProperty("display", "block");
            },
            ref: (el)=>this.zoneContainerRef = el,
            style: {
                fontSize: this.state.fontSizeTitle,
                display: "none",
                cursor: "pointer"
            },
            __source: {
                fileName: "src/SimpleDigitalClockWidget.tsx",
                lineNumber: 301,
                columnNumber: 21
            },
            __self: this
        }, this.state.timeZoneName))) : /*#__PURE__*/ (0, _preact.h)((0, _preact.Fragment), null, "..."), this.state.isError && /*#__PURE__*/ (0, _preact.h)("div", {
            __source: {
                fileName: "src/SimpleDigitalClockWidget.tsx",
                lineNumber: 322,
                columnNumber: 36
            },
            __self: this
        }, "Error, please check attributes of tag."))));
    }
}
exports.default = SimpleDigitalClockWidget;
(0, _preactCustomElementDefault.default)(SimpleDigitalClockWidget, "timenow-zone-sdcw", [
    "background-color",
    "time-zone-name",
    "font-family",
    "background",
    "time-zone",
    "rounded",
    "second",
    "caption",
    "prefers",
    "locale",
    "shadow",
    "border",
    "period",
    "date",
    "width"
], {
    shadow: true
});

},{"preact":"a3Kg2","preact-custom-element":"5kh15","clsx":"3cPI2","bundle-text:./styles.css":"ffcQC","./contrastColor":"hxoDj","./darkenColor":"6WYoE","./data.yaml":"flUmO","./isDark":"inbRE","@parcel/transformer-js/src/esmodule-helpers.js":"6elpC"}],"a3Kg2":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "Component", ()=>b);
parcelHelpers.export(exports, "Fragment", ()=>g);
parcelHelpers.export(exports, "cloneElement", ()=>E);
parcelHelpers.export(exports, "createContext", ()=>F);
parcelHelpers.export(exports, "createElement", ()=>y);
parcelHelpers.export(exports, "createRef", ()=>_);
parcelHelpers.export(exports, "h", ()=>y);
parcelHelpers.export(exports, "hydrate", ()=>B);
parcelHelpers.export(exports, "isValidElement", ()=>t);
parcelHelpers.export(exports, "options", ()=>l);
parcelHelpers.export(exports, "render", ()=>q);
parcelHelpers.export(exports, "toChildArray", ()=>$);
var n, l, u, t, i, o, r, f, e, c = {}, s = [], a = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, h = Array.isArray;
function v(n, l) {
    for(var u in l)n[u] = l[u];
    return n;
}
function p(n) {
    var l = n.parentNode;
    l && l.removeChild(n);
}
function y(l, u, t) {
    var i, o, r, f = {};
    for(r in u)"key" == r ? i = u[r] : "ref" == r ? o = u[r] : f[r] = u[r];
    if (arguments.length > 2 && (f.children = arguments.length > 3 ? n.call(arguments, 2) : t), "function" == typeof l && null != l.defaultProps) for(r in l.defaultProps)void 0 === f[r] && (f[r] = l.defaultProps[r]);
    return d(l, f, i, o, null);
}
function d(n, t, i, o, r) {
    var f = {
        type: n,
        props: t,
        key: i,
        ref: o,
        __k: null,
        __: null,
        __b: 0,
        __e: null,
        __d: void 0,
        __c: null,
        constructor: void 0,
        __v: null == r ? ++u : r,
        __i: -1,
        __u: 0
    };
    return null == r && null != l.vnode && l.vnode(f), f;
}
function _() {
    return {
        current: null
    };
}
function g(n) {
    return n.children;
}
function b(n, l) {
    this.props = n, this.context = l;
}
function m(n, l) {
    if (null == l) return n.__ ? m(n.__, n.__i + 1) : null;
    for(var u; l < n.__k.length; l++)if (null != (u = n.__k[l]) && null != u.__e) return u.__e;
    return "function" == typeof n.type ? m(n) : null;
}
function w(n) {
    var l, u;
    if (null != (n = n.__) && null != n.__c) {
        for(n.__e = n.__c.base = null, l = 0; l < n.__k.length; l++)if (null != (u = n.__k[l]) && null != u.__e) {
            n.__e = n.__c.base = u.__e;
            break;
        }
        return w(n);
    }
}
function k(n) {
    (!n.__d && (n.__d = !0) && i.push(n) && !x.__r++ || o !== l.debounceRendering) && ((o = l.debounceRendering) || r)(x);
}
function x() {
    var n, u, t, o, r, e, c, s, a;
    for(i.sort(f); n = i.shift();)n.__d && (u = i.length, o = void 0, e = (r = (t = n).__v).__e, s = [], a = [], (c = t.__P) && ((o = v({}, r)).__v = r.__v + 1, l.vnode && l.vnode(o), L(c, o, r, t.__n, void 0 !== c.ownerSVGElement, 32 & r.__u ? [
        e
    ] : null, s, null == e ? m(r) : e, !!(32 & r.__u), a), o.__v = r.__v, o.__.__k[o.__i] = o, M(s, o, a), o.__e != e && w(o)), i.length > u && i.sort(f));
    x.__r = 0;
}
function C(n, l, u, t, i, o, r, f, e, a, h) {
    var v, p, y, d, _, g = t && t.__k || s, b = l.length;
    for(u.__d = e, P(u, l, g), e = u.__d, v = 0; v < b; v++)null != (y = u.__k[v]) && "boolean" != typeof y && "function" != typeof y && (p = -1 === y.__i ? c : g[y.__i] || c, y.__i = v, L(n, y, p, i, o, r, f, e, a, h), d = y.__e, y.ref && p.ref != y.ref && (p.ref && z(p.ref, null, y), h.push(y.ref, y.__c || d, y)), null == _ && null != d && (_ = d), 65536 & y.__u || p.__k === y.__k ? (d || p.__e != e || (e = m(p)), e = S(y, e, n)) : "function" == typeof y.type && void 0 !== y.__d ? e = y.__d : d && (e = d.nextSibling), y.__d = void 0, y.__u &= -196609);
    u.__d = e, u.__e = _;
}
function P(n, l, u) {
    var t, i, o, r, f, e = l.length, c = u.length, s = c, a = 0;
    for(n.__k = [], t = 0; t < e; t++)r = t + a, null != (i = n.__k[t] = null == (i = l[t]) || "boolean" == typeof i || "function" == typeof i ? null : "string" == typeof i || "number" == typeof i || "bigint" == typeof i || i.constructor == String ? d(null, i, null, null, null) : h(i) ? d(g, {
        children: i
    }, null, null, null) : void 0 === i.constructor && i.__b > 0 ? d(i.type, i.props, i.key, i.ref ? i.ref : null, i.__v) : i) ? (i.__ = n, i.__b = n.__b + 1, f = H(i, u, r, s), i.__i = f, o = null, -1 !== f && (s--, (o = u[f]) && (o.__u |= 131072)), null == o || null === o.__v ? (-1 == f && a--, "function" != typeof i.type && (i.__u |= 65536)) : f !== r && (f === r + 1 ? a++ : f > r ? s > e - r ? a += f - r : a-- : f < r ? f == r - 1 && (a = f - r) : a = 0, f !== t + a && (i.__u |= 65536))) : (o = u[r]) && null == o.key && o.__e && 0 == (131072 & o.__u) && (o.__e == n.__d && (n.__d = m(o)), N(o, o, !1), u[r] = null, s--);
    if (s) for(t = 0; t < c; t++)null != (o = u[t]) && 0 == (131072 & o.__u) && (o.__e == n.__d && (n.__d = m(o)), N(o, o));
}
function S(n, l, u) {
    var t, i;
    if ("function" == typeof n.type) {
        for(t = n.__k, i = 0; t && i < t.length; i++)t[i] && (t[i].__ = n, l = S(t[i], l, u));
        return l;
    }
    n.__e != l && (u.insertBefore(n.__e, l || null), l = n.__e);
    do l = l && l.nextSibling;
    while (null != l && 8 === l.nodeType);
    return l;
}
function $(n, l) {
    return l = l || [], null == n || "boolean" == typeof n || (h(n) ? n.some(function(n) {
        $(n, l);
    }) : l.push(n)), l;
}
function H(n, l, u, t) {
    var i = n.key, o = n.type, r = u - 1, f = u + 1, e = l[u];
    if (null === e || e && i == e.key && o === e.type && 0 == (131072 & e.__u)) return u;
    if (t > (null != e && 0 == (131072 & e.__u) ? 1 : 0)) for(; r >= 0 || f < l.length;){
        if (r >= 0) {
            if ((e = l[r]) && 0 == (131072 & e.__u) && i == e.key && o === e.type) return r;
            r--;
        }
        if (f < l.length) {
            if ((e = l[f]) && 0 == (131072 & e.__u) && i == e.key && o === e.type) return f;
            f++;
        }
    }
    return -1;
}
function I(n, l, u) {
    "-" === l[0] ? n.setProperty(l, null == u ? "" : u) : n[l] = null == u ? "" : "number" != typeof u || a.test(l) ? u : u + "px";
}
function T(n, l, u, t, i) {
    var o;
    n: if ("style" === l) {
        if ("string" == typeof u) n.style.cssText = u;
        else {
            if ("string" == typeof t && (n.style.cssText = t = ""), t) for(l in t)u && l in u || I(n.style, l, "");
            if (u) for(l in u)t && u[l] === t[l] || I(n.style, l, u[l]);
        }
    } else if ("o" === l[0] && "n" === l[1]) o = l !== (l = l.replace(/(PointerCapture)$|Capture$/i, "$1")), l = l.toLowerCase() in n ? l.toLowerCase().slice(2) : l.slice(2), n.l || (n.l = {}), n.l[l + o] = u, u ? t ? u.u = t.u : (u.u = Date.now(), n.addEventListener(l, o ? D : A, o)) : n.removeEventListener(l, o ? D : A, o);
    else {
        if (i) l = l.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
        else if ("width" !== l && "height" !== l && "href" !== l && "list" !== l && "form" !== l && "tabIndex" !== l && "download" !== l && "rowSpan" !== l && "colSpan" !== l && "role" !== l && l in n) try {
            n[l] = null == u ? "" : u;
            break n;
        } catch (n) {}
        "function" == typeof u || (null == u || !1 === u && "-" !== l[4] ? n.removeAttribute(l) : n.setAttribute(l, u));
    }
}
function A(n) {
    if (this.l) {
        var u = this.l[n.type + !1];
        if (n.t) {
            if (n.t <= u.u) return;
        } else n.t = Date.now();
        return u(l.event ? l.event(n) : n);
    }
}
function D(n) {
    if (this.l) return this.l[n.type + !0](l.event ? l.event(n) : n);
}
function L(n, u, t, i, o, r, f, e, c, s) {
    var a, p, y, d, _, m, w, k, x, P, S, $, H, I, T, A = u.type;
    if (void 0 !== u.constructor) return null;
    128 & t.__u && (c = !!(32 & t.__u), r = [
        e = u.__e = t.__e
    ]), (a = l.__b) && a(u);
    n: if ("function" == typeof A) try {
        if (k = u.props, x = (a = A.contextType) && i[a.__c], P = a ? x ? x.props.value : a.__ : i, t.__c ? w = (p = u.__c = t.__c).__ = p.__E : ("prototype" in A && A.prototype.render ? u.__c = p = new A(k, P) : (u.__c = p = new b(k, P), p.constructor = A, p.render = O), x && x.sub(p), p.props = k, p.state || (p.state = {}), p.context = P, p.__n = i, y = p.__d = !0, p.__h = [], p._sb = []), null == p.__s && (p.__s = p.state), null != A.getDerivedStateFromProps && (p.__s == p.state && (p.__s = v({}, p.__s)), v(p.__s, A.getDerivedStateFromProps(k, p.__s))), d = p.props, _ = p.state, p.__v = u, y) null == A.getDerivedStateFromProps && null != p.componentWillMount && p.componentWillMount(), null != p.componentDidMount && p.__h.push(p.componentDidMount);
        else {
            if (null == A.getDerivedStateFromProps && k !== d && null != p.componentWillReceiveProps && p.componentWillReceiveProps(k, P), !p.__e && (null != p.shouldComponentUpdate && !1 === p.shouldComponentUpdate(k, p.__s, P) || u.__v === t.__v)) {
                for(u.__v !== t.__v && (p.props = k, p.state = p.__s, p.__d = !1), u.__e = t.__e, u.__k = t.__k, u.__k.forEach(function(n) {
                    n && (n.__ = u);
                }), S = 0; S < p._sb.length; S++)p.__h.push(p._sb[S]);
                p._sb = [], p.__h.length && f.push(p);
                break n;
            }
            null != p.componentWillUpdate && p.componentWillUpdate(k, p.__s, P), null != p.componentDidUpdate && p.__h.push(function() {
                p.componentDidUpdate(d, _, m);
            });
        }
        if (p.context = P, p.props = k, p.__P = n, p.__e = !1, $ = l.__r, H = 0, "prototype" in A && A.prototype.render) {
            for(p.state = p.__s, p.__d = !1, $ && $(u), a = p.render(p.props, p.state, p.context), I = 0; I < p._sb.length; I++)p.__h.push(p._sb[I]);
            p._sb = [];
        } else do p.__d = !1, $ && $(u), a = p.render(p.props, p.state, p.context), p.state = p.__s;
        while (p.__d && ++H < 25);
        p.state = p.__s, null != p.getChildContext && (i = v(v({}, i), p.getChildContext())), y || null == p.getSnapshotBeforeUpdate || (m = p.getSnapshotBeforeUpdate(d, _)), C(n, h(T = null != a && a.type === g && null == a.key ? a.props.children : a) ? T : [
            T
        ], u, t, i, o, r, f, e, c, s), p.base = u.__e, u.__u &= -161, p.__h.length && f.push(p), w && (p.__E = p.__ = null);
    } catch (n) {
        u.__v = null, c || null != r ? (u.__e = e, u.__u |= c ? 160 : 32, r[r.indexOf(e)] = null) : (u.__e = t.__e, u.__k = t.__k), l.__e(n, u, t);
    }
    else null == r && u.__v === t.__v ? (u.__k = t.__k, u.__e = t.__e) : u.__e = j(t.__e, u, t, i, o, r, f, c, s);
    (a = l.diffed) && a(u);
}
function M(n, u, t) {
    u.__d = void 0;
    for(var i = 0; i < t.length; i++)z(t[i], t[++i], t[++i]);
    l.__c && l.__c(u, n), n.some(function(u) {
        try {
            n = u.__h, u.__h = [], n.some(function(n) {
                n.call(u);
            });
        } catch (n) {
            l.__e(n, u.__v);
        }
    });
}
function j(l, u, t, i, o, r, f, e, s) {
    var a, v, y, d, _, g, b, w = t.props, k = u.props, x = u.type;
    if ("svg" === x && (o = !0), null != r) {
        for(a = 0; a < r.length; a++)if ((_ = r[a]) && "setAttribute" in _ == !!x && (x ? _.localName === x : 3 === _.nodeType)) {
            l = _, r[a] = null;
            break;
        }
    }
    if (null == l) {
        if (null === x) return document.createTextNode(k);
        l = o ? document.createElementNS("http://www.w3.org/2000/svg", x) : document.createElement(x, k.is && k), r = null, e = !1;
    }
    if (null === x) w === k || e && l.data === k || (l.data = k);
    else {
        if (r = r && n.call(l.childNodes), w = t.props || c, !e && null != r) for(w = {}, a = 0; a < l.attributes.length; a++)w[(_ = l.attributes[a]).name] = _.value;
        for(a in w)_ = w[a], "children" == a || ("dangerouslySetInnerHTML" == a ? y = _ : "key" === a || a in k || T(l, a, null, _, o));
        for(a in k)_ = k[a], "children" == a ? d = _ : "dangerouslySetInnerHTML" == a ? v = _ : "value" == a ? g = _ : "checked" == a ? b = _ : "key" === a || e && "function" != typeof _ || w[a] === _ || T(l, a, _, w[a], o);
        if (v) e || y && (v.__html === y.__html || v.__html === l.innerHTML) || (l.innerHTML = v.__html), u.__k = [];
        else if (y && (l.innerHTML = ""), C(l, h(d) ? d : [
            d
        ], u, t, i, o && "foreignObject" !== x, r, f, r ? r[0] : t.__k && m(t, 0), e, s), null != r) for(a = r.length; a--;)null != r[a] && p(r[a]);
        e || (a = "value", void 0 !== g && (g !== l[a] || "progress" === x && !g || "option" === x && g !== w[a]) && T(l, a, g, w[a], !1), a = "checked", void 0 !== b && b !== l[a] && T(l, a, b, w[a], !1));
    }
    return l;
}
function z(n, u, t) {
    try {
        "function" == typeof n ? n(u) : n.current = u;
    } catch (n) {
        l.__e(n, t);
    }
}
function N(n, u, t) {
    var i, o;
    if (l.unmount && l.unmount(n), (i = n.ref) && (i.current && i.current !== n.__e || z(i, null, u)), null != (i = n.__c)) {
        if (i.componentWillUnmount) try {
            i.componentWillUnmount();
        } catch (n) {
            l.__e(n, u);
        }
        i.base = i.__P = null, n.__c = void 0;
    }
    if (i = n.__k) for(o = 0; o < i.length; o++)i[o] && N(i[o], u, t || "function" != typeof n.type);
    t || null == n.__e || p(n.__e), n.__ = n.__e = n.__d = void 0;
}
function O(n, l, u) {
    return this.constructor(n, u);
}
function q(u, t, i) {
    var o, r, f, e;
    l.__ && l.__(u, t), r = (o = "function" == typeof i) ? null : i && i.__k || t.__k, f = [], e = [], L(t, u = (!o && i || t).__k = y(g, null, [
        u
    ]), r || c, c, void 0 !== t.ownerSVGElement, !o && i ? [
        i
    ] : r ? null : t.firstChild ? n.call(t.childNodes) : null, f, !o && i ? i : r ? r.__e : t.firstChild, o, e), M(f, u, e);
}
function B(n, l) {
    q(n, l, B);
}
function E(l, u, t) {
    var i, o, r, f, e = v({}, l.props);
    for(r in l.type && l.type.defaultProps && (f = l.type.defaultProps), u)"key" == r ? i = u[r] : "ref" == r ? o = u[r] : e[r] = void 0 === u[r] && void 0 !== f ? f[r] : u[r];
    return arguments.length > 2 && (e.children = arguments.length > 3 ? n.call(arguments, 2) : t), d(l.type, e, i || l.key, o || l.ref, null);
}
function F(n, l) {
    var u = {
        __c: l = "__cC" + e++,
        __: n,
        Consumer: function(n, l) {
            return n.children(l);
        },
        Provider: function(n) {
            var u, t;
            return this.getChildContext || (u = [], (t = {})[l] = this, this.getChildContext = function() {
                return t;
            }, this.shouldComponentUpdate = function(n) {
                this.props.value !== n.value && u.some(function(n) {
                    n.__e = !0, k(n);
                });
            }, this.sub = function(n) {
                u.push(n);
                var l = n.componentWillUnmount;
                n.componentWillUnmount = function() {
                    u.splice(u.indexOf(n), 1), l && l.call(n);
                };
            }), n.children;
        }
    };
    return u.Provider.__ = u.Consumer.contextType = u;
}
n = s.slice, l = {
    __e: function(n, l, u, t) {
        for(var i, o, r; l = l.__;)if ((i = l.__c) && !i.__) try {
            if ((o = i.constructor) && null != o.getDerivedStateFromError && (i.setState(o.getDerivedStateFromError(n)), r = i.__d), null != i.componentDidCatch && (i.componentDidCatch(n, t || {}), r = i.__d), r) return i.__E = i;
        } catch (l) {
            n = l;
        }
        throw n;
    }
}, u = 0, t = function(n) {
    return null != n && null == n.constructor;
}, b.prototype.setState = function(n, l) {
    var u;
    u = null != this.__s && this.__s !== this.state ? this.__s : this.__s = v({}, this.state), "function" == typeof n && (n = n(v({}, u), this.props)), n && v(u, n), null != n && this.__v && (l && this._sb.push(l), k(this));
}, b.prototype.forceUpdate = function(n) {
    this.__v && (this.__e = !0, n && this.__h.push(n), k(this));
}, b.prototype.render = g, i = [], r = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, f = function(n, l) {
    return n.__v.__b - l.__v.__b;
}, x.__r = 0, e = 0;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"6elpC"}],"6elpC":[function(require,module,exports) {
exports.interopDefault = function(a) {
    return a && a.__esModule ? a : {
        default: a
    };
};
exports.defineInteropFlag = function(a) {
    Object.defineProperty(a, "__esModule", {
        value: true
    });
};
exports.exportAll = function(source, dest) {
    Object.keys(source).forEach(function(key) {
        if (key === "default" || key === "__esModule" || Object.prototype.hasOwnProperty.call(dest, key)) return;
        Object.defineProperty(dest, key, {
            enumerable: true,
            get: function() {
                return source[key];
            }
        });
    });
    return dest;
};
exports.export = function(dest, destName, get) {
    Object.defineProperty(dest, destName, {
        enumerable: true,
        get: get
    });
};

},{}],"5kh15":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "default", ()=>function(t, e, n, o) {
        function r() {
            var e = Reflect.construct(HTMLElement, [], r);
            return e._vdomComponent = t, e._root = o && o.shadow ? e.attachShadow({
                mode: o.mode || "open"
            }) : e, e;
        }
        return (r.prototype = Object.create(HTMLElement.prototype)).constructor = r, r.prototype.connectedCallback = s, r.prototype.attributeChangedCallback = l, r.prototype.disconnectedCallback = u, n = n || t.observedAttributes || Object.keys(t.propTypes || {}), r.observedAttributes = n, n.forEach(function(t) {
            Object.defineProperty(r.prototype, t, {
                get: function() {
                    return this._vdom.props[t];
                },
                set: function(e) {
                    this._vdom ? this.attributeChangedCallback(t, null, e) : (this._props || (this._props = {}), this._props[t] = e, this.connectedCallback());
                    var n = typeof e;
                    null != e && "string" !== n && "boolean" !== n && "number" !== n || this.setAttribute(t, e);
                }
            });
        }), customElements.define(e || t.tagName || t.displayName || t.name, r);
    });
var _preact = require("preact");
function r() {
    return (r = Object.assign ? Object.assign.bind() : function(t) {
        for(var e = 1; e < arguments.length; e++){
            var n = arguments[e];
            for(var o in n)Object.prototype.hasOwnProperty.call(n, o) && (t[o] = n[o]);
        }
        return t;
    }).apply(this, arguments);
}
var i = [
    "context",
    "children"
];
function a(t) {
    this.getChildContext = function() {
        return t.context;
    };
    var e = t.children, n = function(t, e) {
        if (null == t) return {};
        var n, o, r = {}, i = Object.keys(t);
        for(o = 0; o < i.length; o++)e.indexOf(n = i[o]) >= 0 || (r[n] = t[n]);
        return r;
    }(t, i);
    return (0, _preact.cloneElement)(e, n);
}
function s() {
    var o = new CustomEvent("_preact", {
        detail: {},
        bubbles: !0,
        cancelable: !0
    });
    this.dispatchEvent(o), this._vdom = (0, _preact.h)(a, r({}, this._props, {
        context: o.detail.context
    }), function e(n, o) {
        if (3 === n.nodeType) return n.data;
        if (1 !== n.nodeType) return null;
        var r = [], i = {}, a = 0, s = n.attributes, l = n.childNodes;
        for(a = s.length; a--;)"slot" !== s[a].name && (i[s[a].name] = s[a].value, i[c(s[a].name)] = s[a].value);
        for(a = l.length; a--;){
            var u = e(l[a], null), d = l[a].slot;
            d ? i[d] = (0, _preact.h)(p, {
                name: d
            }, u) : r[a] = u;
        }
        var h = o ? (0, _preact.h)(p, null, r) : r;
        return (0, _preact.h)(o || n.nodeName.toLowerCase(), i, h);
    }(this, this._vdomComponent)), (this.hasAttribute("hydrate") ? (0, _preact.hydrate) : (0, _preact.render))(this._vdom, this._root);
}
function c(t) {
    return t.replace(/-(\w)/g, function(t, e) {
        return e ? e.toUpperCase() : "";
    });
}
function l(t, e, r) {
    if (this._vdom) {
        var i = {};
        i[t] = r = null == r ? void 0 : r, i[c(t)] = r, this._vdom = (0, _preact.cloneElement)(this._vdom, i), (0, _preact.render)(this._vdom, this._root);
    }
}
function u() {
    (0, _preact.render)(this._vdom = null, this._root);
}
function p(e, n) {
    var o = this;
    return (0, _preact.h)("slot", r({}, e, {
        ref: function(t) {
            t ? (o.ref = t, o._listener || (o._listener = function(t) {
                t.stopPropagation(), t.detail.context = n;
            }, t.addEventListener("_preact", o._listener))) : o.ref.removeEventListener("_preact", o._listener);
        }
    }));
}

},{"preact":"a3Kg2","@parcel/transformer-js/src/esmodule-helpers.js":"6elpC"}],"3cPI2":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "clsx", ()=>clsx);
function r(e) {
    var t, f, n = "";
    if ("string" == typeof e || "number" == typeof e) n += e;
    else if ("object" == typeof e) {
        if (Array.isArray(e)) {
            var o = e.length;
            for(t = 0; t < o; t++)e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
        } else for(f in e)e[f] && (n && (n += " "), n += f);
    }
    return n;
}
function clsx() {
    for(var e, t, f = 0, n = "", o = arguments.length; f < o; f++)(e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
    return n;
}
exports.default = clsx;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"6elpC"}],"ffcQC":[function(require,module,exports) {
module.exports = "*, :before, :after {\n  box-sizing: border-box;\n  border: 0 solid #e5e7eb;\n}\n\n:before, :after {\n  --tw-content: \"\";\n}\n\nhtml, :host {\n  -webkit-text-size-adjust: 100%;\n  tab-size: 4;\n  font-feature-settings: normal;\n  font-variation-settings: normal;\n  -webkit-tap-highlight-color: transparent;\n  font-family: ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;\n  line-height: 1.5;\n}\n\nbody {\n  line-height: inherit;\n  margin: 0;\n}\n\nhr {\n  color: inherit;\n  border-top-width: 1px;\n  height: 0;\n}\n\nabbr:where([title]) {\n  text-decoration: underline dotted;\n}\n\nh1, h2, h3, h4, h5, h6 {\n  font-size: inherit;\n  font-weight: inherit;\n}\n\na {\n  color: inherit;\n  -webkit-text-decoration: inherit;\n  text-decoration: inherit;\n}\n\nb, strong {\n  font-weight: bolder;\n}\n\ncode, kbd, samp, pre {\n  font-feature-settings: normal;\n  font-variation-settings: normal;\n  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;\n  font-size: 1em;\n}\n\nsmall {\n  font-size: 80%;\n}\n\nsub, sup {\n  vertical-align: baseline;\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n}\n\nsub {\n  bottom: -.25em;\n}\n\nsup {\n  top: -.5em;\n}\n\ntable {\n  text-indent: 0;\n  border-color: inherit;\n  border-collapse: collapse;\n}\n\nbutton, input, optgroup, select, textarea {\n  font-feature-settings: inherit;\n  font-variation-settings: inherit;\n  font-family: inherit;\n  font-size: 100%;\n  font-weight: inherit;\n  line-height: inherit;\n  color: inherit;\n  margin: 0;\n  padding: 0;\n}\n\nbutton, select {\n  text-transform: none;\n}\n\nbutton, [type=\"button\"], [type=\"reset\"], [type=\"submit\"] {\n  -webkit-appearance: button;\n  background-color: #0000;\n  background-image: none;\n}\n\n:-moz-focusring {\n  outline: auto;\n}\n\n:-moz-ui-invalid {\n  box-shadow: none;\n}\n\nprogress {\n  vertical-align: baseline;\n}\n\n::-webkit-inner-spin-button {\n  height: auto;\n}\n\n::-webkit-outer-spin-button {\n  height: auto;\n}\n\n[type=\"search\"] {\n  -webkit-appearance: textfield;\n  outline-offset: -2px;\n}\n\n::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n\n::-webkit-file-upload-button {\n  -webkit-appearance: button;\n  font: inherit;\n}\n\nsummary {\n  display: list-item;\n}\n\nblockquote, dl, dd, h1, h2, h3, h4, h5, h6, hr, figure, p, pre {\n  margin: 0;\n}\n\nfieldset {\n  margin: 0;\n  padding: 0;\n}\n\nlegend {\n  padding: 0;\n}\n\nol, ul, menu {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\ndialog {\n  padding: 0;\n}\n\ntextarea {\n  resize: vertical;\n}\n\ninput::placeholder, textarea::placeholder {\n  opacity: 1;\n  color: #9ca3af;\n}\n\nbutton, [role=\"button\"] {\n  cursor: pointer;\n}\n\n:disabled {\n  cursor: default;\n}\n\nimg, svg, video, canvas, audio, iframe, embed, object {\n  vertical-align: middle;\n  display: block;\n}\n\nimg, video {\n  max-width: 100%;\n  height: auto;\n}\n\n[hidden] {\n  display: none;\n}\n\n*, :before, :after, ::backdrop {\n  --tw-border-spacing-x: 0;\n  --tw-border-spacing-y: 0;\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x: ;\n  --tw-pan-y: ;\n  --tw-pinch-zoom: ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-gradient-from-position: ;\n  --tw-gradient-via-position: ;\n  --tw-gradient-to-position: ;\n  --tw-ordinal: ;\n  --tw-slashed-zero: ;\n  --tw-numeric-figure: ;\n  --tw-numeric-spacing: ;\n  --tw-numeric-fraction: ;\n  --tw-ring-inset: ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: #3b82f680;\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur: ;\n  --tw-brightness: ;\n  --tw-contrast: ;\n  --tw-grayscale: ;\n  --tw-hue-rotate: ;\n  --tw-invert: ;\n  --tw-saturate: ;\n  --tw-sepia: ;\n  --tw-drop-shadow: ;\n  --tw-backdrop-blur: ;\n  --tw-backdrop-brightness: ;\n  --tw-backdrop-contrast: ;\n  --tw-backdrop-grayscale: ;\n  --tw-backdrop-hue-rotate: ;\n  --tw-backdrop-invert: ;\n  --tw-backdrop-opacity: ;\n  --tw-backdrop-saturate: ;\n  --tw-backdrop-sepia: ;\n}\n\n.relative {\n  position: relative;\n}\n\n.block {\n  display: block;\n}\n\n.resize {\n  resize: both;\n}\n\n.rounded {\n  border-radius: .25rem;\n}\n\n.border {\n  border-width: 1px;\n}\n\n.shadow {\n  --tw-shadow: 0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a;\n  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.shadow-2xl {\n  --tw-shadow: 0 25px 50px -12px #00000040;\n  --tw-shadow-colored: 0 25px 50px -12px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.shadow-lg {\n  --tw-shadow: 0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a;\n  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.shadow-md {\n  --tw-shadow: 0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a;\n  --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.shadow-sm {\n  --tw-shadow: 0 1px 2px 0 #0000000d;\n  --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.shadow-xl {\n  --tw-shadow: 0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a;\n  --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.transition {\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter;\n  transition-duration: .15s;\n  transition-timing-function: cubic-bezier(.4, 0, .2, 1);\n}\n\n.widget {\n  text-transform: uppercase;\n  justify-content: center;\n  align-items: center;\n  padding-top: .5rem;\n  padding-bottom: .5rem;\n  display: flex;\n}\n\n.font-family {\n  font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Liberation Sans, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;\n}\n";

},{}],"hxoDj":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
function contrastColor(inputColor) {
    let r, g, b;
    if (inputColor.startsWith("#")) {
        // If input is HEX, with or without alpha
        const hex = inputColor.slice(1); // Remove the '#'
        const isShort = hex.length === 4 || hex.length === 3; // Short hex #RGB or #RGBA
        const multiplier = isShort ? 1 : 2;
        r = parseInt(hex.substring(0, multiplier), 16);
        g = parseInt(hex.substring(multiplier, 2 * multiplier), 16);
        b = parseInt(hex.substring(2 * multiplier, 3 * multiplier), 16);
        if (isShort) {
            // Convert short hex to full hex values
            r = r * 16 + r;
            g = g * 16 + g;
            b = b * 16 + b;
        }
    } else if (inputColor.startsWith("rgb")) {
        // If input is RGB or RGBA
        const colors = inputColor.substring(inputColor.indexOf("(") + 1, inputColor.lastIndexOf(")")).split(/,\s*/);
        [r, g, b] = colors.map(Number); // Convert string array to number array
    } else throw new Error("Color format not recognized. Please input HEX, RGB, or RGBA format.");
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    // Return black for light colors, white for dark colors
    return luminance > 0.5 ? "black" : "white";
}
exports.default = contrastColor;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"6elpC"}],"6WYoE":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
function darkenColor(color, percent) {
    let R, G, B, A;
    // Check for HEX format with alpha channel and parse it
    if (color[0] === "#" && (color.length === 9 || color.length === 5)) {
        const hex = color.length === 9 ? color.slice(1) : color.slice(1).split("").map((c)=>c + c).join("");
        const f = parseInt(hex, 16);
        R = f >> 24 & 0xff;
        G = f >> 16 & 0xff;
        B = f >> 8 & 0xff;
        A = (f & 0xff) / 255;
    } else if (color[0] === "#" && (color.length === 7 || color.length === 4)) {
        const hex = color.length === 7 ? color.slice(1) : color.slice(1).split("").map((c)=>c + c).join("");
        const f = parseInt(hex, 16);
        R = f >> 16;
        G = f >> 8 & 0xff;
        B = f & 0xff;
        A = 1; // Default alpha value is 1 for fully opaque
    } else if (color.startsWith("rgb")) {
        const components = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.?\d*))?\)/i);
        if (components) {
            R = parseInt(components[1], 10);
            G = parseInt(components[2], 10);
            B = parseInt(components[3], 10);
            A = components[4] !== undefined ? parseFloat(components[4]) : 1;
        } else throw new Error("Invalid color format");
    } else throw new Error("Invalid color format");
    // Apply darkening
    const t = percent < 0 ? 0 : 255;
    const p = percent < 0 ? -percent : percent;
    R = Math.round((t - R) * p) + R;
    G = Math.round((t - G) * p) + G;
    B = Math.round((t - B) * p) + B;
    // Return color in original format
    if (color[0] === "#" && (color.length === 9 || color.length === 5)) return `#${(16777216 + (R << 16) + (G << 8) + B).toString(16).slice(1)}${(A * 255).toString(16).padStart(2, "0")}`;
    else if (color[0] === "#") return `#${(16777216 + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
    else if (color.startsWith("rgba")) return `rgba(${R}, ${G}, ${B}, ${A})`;
    return `rgb(${R}, ${G}, ${B})`;
}
exports.default = darkenColor;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"6elpC"}],"flUmO":[function(require,module,exports) {
module.exports = {
    "allowFonts": [
        "Sono",
        "Roboto Mono",
        "Sometype Mono",
        "Inconsolata",
        "Source Code Pro",
        "IBM Plex Mono",
        "Space Mono",
        "Ubuntu Mono",
        "Nanum Gothic Coding",
        "Courier Prime",
        "JetBrains Mono",
        "Fira Mono",
        "Cousine",
        "Anonymous Pro",
        "Noto Sans Mono",
        "Fira Code",
        "Overpass Mono",
        "B612 Mono",
        "Victor Mono",
        "Chivo Mono",
        "Azeret Mono",
        "Martian Mono",
        "Red Hat Mono",
        "Spline Sans Mono"
    ]
};

},{}],"inbRE":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
function isDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}
exports.default = isDark;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"6elpC"}]},["jlseL","lqflI"], "lqflI", "parcelRequired811")

//# sourceMappingURL=index.9f02a213.js.map
