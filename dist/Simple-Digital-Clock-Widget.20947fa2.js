// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (modules, entry, mainEntry, parcelRequireName, externals, distDir, publicUrl, devServer) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== "undefined"
      ? globalThis
      : typeof self !== "undefined"
        ? self
        : typeof window !== "undefined"
          ? window
          : typeof global !== "undefined"
            ? global
            : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === "function" && globalObject[parcelRequireName];

  var importMap = previousRequire.i || {};
  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== "undefined" &&
    typeof module.require === "function" &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        if (externals[name]) {
          return externals[name];
        }
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === "function" && globalObject[parcelRequireName];
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
        if (nodeRequire && typeof name === "string") {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = "MODULE_NOT_FOUND";
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(module.exports, localRequire, module, module.exports, globalObject);
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
    this.require = nodeRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.distDir = distDir;
  newRequire.publicUrl = publicUrl;
  newRequire.devServer = devServer;
  newRequire.i = importMap;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  // Only insert newRequire.load when it is actually used.
  // The code in this file is linted against ES5, so dynamic import is not allowed.
  // INSERT_LOAD_HERE

  Object.defineProperty(newRequire, "root", {
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
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === "function" && define.amd) {
      define(function () {
        return mainExports;
      });
    }
  }
})(
  {
    bjVXy: [
      function (require, module, exports, __globalThis) {
        var global = arguments[3];
        var HMR_HOST = null;
        var HMR_PORT = null;
        var HMR_SERVER_PORT = 1234;
        var HMR_SECURE = false;
        var HMR_ENV_HASH = "439701173a9199ea";
        var HMR_USE_SSE = false;
        module.bundle.HMR_BUNDLE_ID = "7f5b301020947fa2";
        ("use strict");
        /* global HMR_HOST, HMR_PORT, HMR_SERVER_PORT, HMR_ENV_HASH, HMR_SECURE, HMR_USE_SSE, chrome, browser, __parcel__import__, __parcel__importScripts__, ServiceWorkerGlobalScope */ /*::
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
declare var HMR_SERVER_PORT: string;
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
            accept: function (fn) {
              this._acceptCallbacks.push(fn || function () {});
            },
            dispose: function (fn) {
              this._disposeCallbacks.push(fn);
            },
          };
          module.bundle.hotData[moduleName] = undefined;
        }
        module.bundle.Module = Module;
        module.bundle.hotData = {};
        var checkedAssets /*: {|[string]: boolean|} */,
          disposedAssets /*: {|[string]: boolean|} */,
          assetsToDispose /*: Array<[ParcelRequire, string]> */,
          assetsToAccept /*: Array<[ParcelRequire, string]> */,
          bundleNotFound = false;
        function getHostname() {
          return (
            HMR_HOST ||
            (typeof location !== "undefined" && location.protocol.indexOf("http") === 0
              ? location.hostname
              : "localhost")
          );
        }
        function getPort() {
          return HMR_PORT || (typeof location !== "undefined" ? location.port : HMR_SERVER_PORT);
        }
        // eslint-disable-next-line no-redeclare
        let WebSocket = globalThis.WebSocket;
        if (!WebSocket && typeof module.bundle.root === "function")
          try {
            // eslint-disable-next-line no-global-assign
            WebSocket = module.bundle.root("ws");
          } catch {
            // ignore.
          }
        var hostname = getHostname();
        var port = getPort();
        var protocol =
          HMR_SECURE ||
          (typeof location !== "undefined" &&
            location.protocol === "https:" &&
            !["localhost", "127.0.0.1", "0.0.0.0"].includes(hostname))
            ? "wss"
            : "ws";
        // eslint-disable-next-line no-redeclare
        var parent = module.bundle.parent;
        if (!parent || !parent.isParcelRequire) {
          // Web extension context
          var extCtx =
            typeof browser === "undefined"
              ? typeof chrome === "undefined"
                ? null
                : chrome
              : browser;
          // Safari doesn't support sourceURL in error stacks.
          // eval may also be disabled via CSP, so do a quick check.
          var supportsSourceURL = false;
          try {
            (0, eval)('throw new Error("test"); //# sourceURL=test.js');
          } catch (err) {
            supportsSourceURL = err.stack.includes("test.js");
          }
          var ws;
          if (HMR_USE_SSE) ws = new EventSource("/__parcel_hmr");
          else
            try {
              // If we're running in the dev server's node runner, listen for messages on the parent port.
              let { workerData, parentPort } = module.bundle.root("node:worker_threads"); /*: any*/
              if (workerData !== null && workerData !== void 0 && workerData.__parcel) {
                parentPort.on("message", async (message) => {
                  try {
                    await handleMessage(message);
                    parentPort.postMessage("updated");
                  } catch {
                    parentPort.postMessage("restart");
                  }
                });
                // After the bundle has finished running, notify the dev server that the HMR update is complete.
                queueMicrotask(() => parentPort.postMessage("ready"));
              }
            } catch {
              if (typeof WebSocket !== "undefined")
                try {
                  ws = new WebSocket(protocol + "://" + hostname + (port ? ":" + port : "") + "/");
                } catch (err) {
                  // Ignore cloudflare workers error.
                  if (
                    err.message &&
                    !err.message.includes("Disallowed operation called within global scope")
                  )
                    console.error(err.message);
                }
            }
          if (ws) {
            // $FlowFixMe
            ws.onmessage = async function (event /*: {data: string, ...} */) {
              var data /*: HMRMessage */ = JSON.parse(event.data);
              await handleMessage(data);
            };
            if (ws instanceof WebSocket) {
              ws.onerror = function (e) {
                if (e.message) console.error(e.message);
              };
              ws.onclose = function () {
                console.warn("[parcel] \uD83D\uDEA8 Connection to the HMR server was lost");
              };
            }
          }
        }
        async function handleMessage(data /*: HMRMessage */) {
          checkedAssets = {} /*: {|[string]: boolean|} */;
          disposedAssets = {} /*: {|[string]: boolean|} */;
          assetsToAccept = [];
          assetsToDispose = [];
          bundleNotFound = false;
          if (data.type === "reload") fullReload();
          else if (data.type === "update") {
            // Remove error overlay if there is one
            if (typeof document !== "undefined") removeErrorOverlay();
            let assets = data.assets;
            // Handle HMR Update
            let handled = assets.every((asset) => {
              return (
                asset.type === "css" ||
                (asset.type === "js" &&
                  hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle))
              );
            });
            // Dispatch a custom event in case a bundle was not found. This might mean
            // an asset on the server changed and we should reload the page. This event
            // gives the client an opportunity to refresh without losing state
            // (e.g. via React Server Components). If e.preventDefault() is not called,
            // we will trigger a full page reload.
            if (
              handled &&
              bundleNotFound &&
              assets.some((a) => a.envHash !== HMR_ENV_HASH) &&
              typeof window !== "undefined" &&
              typeof CustomEvent !== "undefined"
            )
              handled = !window.dispatchEvent(
                new CustomEvent("parcelhmrreload", {
                  cancelable: true,
                })
              );
            if (handled) {
              console.clear();
              // Dispatch custom event so other runtimes (e.g React Refresh) are aware.
              if (typeof window !== "undefined" && typeof CustomEvent !== "undefined")
                window.dispatchEvent(new CustomEvent("parcelhmraccept"));
              await hmrApplyUpdates(assets);
              hmrDisposeQueue();
              // Run accept callbacks. This will also re-execute other disposed assets in topological order.
              let processedAssets = {};
              for (let i = 0; i < assetsToAccept.length; i++) {
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
            for (let ansiDiagnostic of data.diagnostics.ansi) {
              let stack = ansiDiagnostic.codeframe
                ? ansiDiagnostic.codeframe
                : ansiDiagnostic.stack;
              console.error(
                "\uD83D\uDEA8 [parcel]: " +
                  ansiDiagnostic.message +
                  "\n" +
                  stack +
                  "\n\n" +
                  ansiDiagnostic.hints.join("\n")
              );
            }
            if (typeof document !== "undefined") {
              // Render the fancy html overlay
              removeErrorOverlay();
              var overlay = createErrorOverlay(data.diagnostics.html);
              // $FlowFixMe
              document.body.appendChild(overlay);
            }
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
          let errorHTML =
            '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
          for (let diagnostic of diagnostics) {
            let stack = diagnostic.frames.length
              ? diagnostic.frames.reduce((p, frame) => {
                  return `${p}
<a href="${protocol === "wss" ? "https" : "http"}://${hostname}:${port}/__parcel_launch_editor?file=${encodeURIComponent(frame.location)}" style="text-decoration: underline; color: #888" onclick="fetch(this.href); return false">${frame.location}</a>
${frame.code}`;
                }, "")
              : diagnostic.stack;
            errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          \u{1F6A8} ${diagnostic.message}
        </div>
        <pre>${stack}</pre>
        <div>
          ${diagnostic.hints.map((hint) => "<div>\uD83D\uDCA1 " + hint + "</div>").join("")}
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
          if (typeof location !== "undefined" && "reload" in location) location.reload();
          else if (
            typeof extCtx !== "undefined" &&
            extCtx &&
            extCtx.runtime &&
            extCtx.runtime.reload
          )
            extCtx.runtime.reload();
          else
            try {
              let { workerData, parentPort } = module.bundle.root("node:worker_threads"); /*: any*/
              if (workerData !== null && workerData !== void 0 && workerData.__parcel)
                parentPort.postMessage("restart");
            } catch (err) {
              console.error(
                "[parcel] \u26A0\uFE0F An HMR update was not accepted. Please restart the process."
              );
            }
        }
        function getParents(bundle, id) /*: Array<[ParcelRequire, string]> */ {
          var modules = bundle.modules;
          if (!modules) return [];
          var parents = [];
          var k, d, dep;
          for (k in modules)
            for (d in modules[k][1]) {
              dep = modules[k][1][d];
              if (dep === id || (Array.isArray(dep) && dep[dep.length - 1] === id))
                parents.push([bundle, k]);
            }
          if (bundle.parent) parents = parents.concat(getParents(bundle.parent, id));
          return parents;
        }
        function updateLink(link) {
          var href = link.getAttribute("href");
          if (!href) return;
          var newLink = link.cloneNode();
          newLink.onload = function () {
            if (link.parentNode !== null)
              // $FlowFixMe
              link.parentNode.removeChild(link);
          };
          newLink.setAttribute(
            "href", // $FlowFixMe
            href.split("?")[0] + "?" + Date.now()
          );
          // $FlowFixMe
          link.parentNode.insertBefore(newLink, link.nextSibling);
        }
        var cssTimeout = null;
        function reloadCSS() {
          if (cssTimeout || typeof document === "undefined") return;
          cssTimeout = setTimeout(function () {
            var links = document.querySelectorAll('link[rel="stylesheet"]');
            for (var i = 0; i < links.length; i++) {
              // $FlowFixMe[incompatible-type]
              var href /*: string */ = links[i].getAttribute("href");
              var hostname = getHostname();
              var servedFromHMRServer =
                hostname === "localhost"
                  ? new RegExp("^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):" + getPort()).test(
                      href
                    )
                  : href.indexOf(hostname + ":" + getPort());
              var absolute =
                /^https?:\/\//i.test(href) &&
                href.indexOf(location.origin) !== 0 &&
                !servedFromHMRServer;
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
              return new Promise((resolve, reject) => {
                var _document$head;
                script.onload = () => resolve(script);
                script.onerror = reject;
                (_document$head = document.head) === null ||
                  _document$head === void 0 ||
                  _document$head.appendChild(script);
              });
            } else if (typeof importScripts === "function") {
              // Worker scripts
              if (asset.outputFormat === "esmodule") return import(asset.url + "?t=" + Date.now());
              else
                return new Promise((resolve, reject) => {
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
              let promises = assets.map((asset) => {
                var _hmrDownload;
                return (_hmrDownload = hmrDownload(asset)) === null || _hmrDownload === void 0
                  ? void 0
                  : _hmrDownload.catch((err) => {
                      // Web extension fix
                      if (
                        extCtx &&
                        extCtx.runtime &&
                        extCtx.runtime.getManifest().manifest_version == 3 &&
                        typeof ServiceWorkerGlobalScope != "undefined" &&
                        global instanceof ServiceWorkerGlobalScope
                      ) {
                        extCtx.runtime.reload();
                        return;
                      }
                      throw err;
                    });
              });
              scriptsToRemove = await Promise.all(promises);
            }
            assets.forEach(function (asset) {
              hmrApply(module.bundle.root, asset);
            });
          } finally {
            delete global.parcelHotUpdate;
            if (scriptsToRemove)
              scriptsToRemove.forEach((script) => {
                if (script) {
                  var _document$head2;
                  (_document$head2 = document.head) === null ||
                    _document$head2 === void 0 ||
                    _document$head2.removeChild(script);
                }
              });
          }
        }
        function hmrApply(bundle /*: ParcelRequire */, asset /*:  HMRAsset */) {
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
                for (let dep in oldDeps)
                  if (!deps[dep] || deps[dep] !== oldDeps[dep]) {
                    let id = oldDeps[dep];
                    let parents = getParents(module.bundle.root, id);
                    if (parents.length === 1) hmrDelete(module.bundle.root, id);
                  }
              }
              if (supportsSourceURL)
                // Global eval. We would use `new Function` here but browser
                // support for source maps is better with eval.
                (0, eval)(asset.output);
              // $FlowFixMe
              let fn = global.parcelHotUpdate[asset.id];
              modules[asset.id] = [fn, deps];
            }
            // Always traverse to the parent bundle, even if we already replaced the asset in this bundle.
            // This is required in case modules are duplicated. We need to ensure all instances have the updated code.
            if (bundle.parent) hmrApply(bundle.parent, asset);
          }
        }
        function hmrDelete(bundle, id) {
          let modules = bundle.modules;
          if (!modules) return;
          if (modules[id]) {
            // Collect dependencies that will become orphaned when this module is deleted.
            let deps = modules[id][1];
            let orphans = [];
            for (let dep in deps) {
              let parents = getParents(module.bundle.root, deps[dep]);
              if (parents.length === 1) orphans.push(deps[dep]);
            }
            // Delete the module. This must be done before deleting dependencies in case of circular dependencies.
            delete modules[id];
            delete bundle.cache[id];
            // Now delete the orphans.
            orphans.forEach((id) => {
              hmrDelete(module.bundle.root, id);
            });
          } else if (bundle.parent) hmrDelete(bundle.parent, id);
        }
        function hmrAcceptCheck(
          bundle /*: ParcelRequire */,
          id /*: string */,
          depsByBundle /*: ?{ [string]: { [string]: string } }*/
        ) {
          checkedAssets = {};
          if (hmrAcceptCheckOne(bundle, id, depsByBundle)) return true;
          // Traverse parents breadth first. All possible ancestries must accept the HMR update, or we'll reload.
          let parents = getParents(module.bundle.root, id);
          let accepted = false;
          while (parents.length > 0) {
            let v = parents.shift();
            let a = hmrAcceptCheckOne(v[0], v[1], null);
            if (a)
              // If this parent accepts, stop traversing upward, but still consider siblings.
              accepted = true;
            else if (a !== null) {
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
        function hmrAcceptCheckOne(
          bundle /*: ParcelRequire */,
          id /*: string */,
          depsByBundle /*: ?{ [string]: { [string]: string } }*/
        ) {
          var modules = bundle.modules;
          if (!modules) return;
          if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
            // If we reached the root bundle without finding where the asset should go,
            // there's nothing to do. Mark as "accepted" so we don't reload the page.
            if (!bundle.parent) {
              bundleNotFound = true;
              return true;
            }
            return hmrAcceptCheckOne(bundle.parent, id, depsByBundle);
          }
          if (checkedAssets[id]) return null;
          checkedAssets[id] = true;
          var cached = bundle.cache[id];
          if (!cached) return true;
          assetsToDispose.push([bundle, id]);
          if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
            assetsToAccept.push([bundle, id]);
            return true;
          }
          return false;
        }
        function hmrDisposeQueue() {
          // Dispose all old assets.
          for (let i = 0; i < assetsToDispose.length; i++) {
            let id = assetsToDispose[i][1];
            if (!disposedAssets[id]) {
              hmrDispose(assetsToDispose[i][0], id);
              disposedAssets[id] = true;
            }
          }
          assetsToDispose = [];
        }
        function hmrDispose(bundle /*: ParcelRequire */, id /*: string */) {
          var cached = bundle.cache[id];
          bundle.hotData[id] = {};
          if (cached && cached.hot) cached.hot.data = bundle.hotData[id];
          if (cached && cached.hot && cached.hot._disposeCallbacks.length)
            cached.hot._disposeCallbacks.forEach(function (cb) {
              cb(bundle.hotData[id]);
            });
          delete bundle.cache[id];
        }
        function hmrAccept(bundle /*: ParcelRequire */, id /*: string */) {
          // Execute the module.
          bundle(id);
          // Run the accept callbacks in the new version of the module.
          var cached = bundle.cache[id];
          if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
            let assetsToAlsoAccept = [];
            cached.hot._acceptCallbacks.forEach(function (cb) {
              let additionalAssets = cb(function () {
                return getParents(module.bundle.root, id);
              });
              if (Array.isArray(additionalAssets) && additionalAssets.length)
                assetsToAlsoAccept.push(...additionalAssets);
            });
            if (assetsToAlsoAccept.length) {
              let handled = assetsToAlsoAccept.every(function (a) {
                return hmrAcceptCheck(a[0], a[1]);
              });
              if (!handled) return fullReload();
              hmrDisposeQueue();
            }
          }
        }
      },
      {},
    ],
    "6Jsm5": [
      function (require, module, exports, __globalThis) {
        /*
         * Simple Digital Clock Widget
         * This is a simple digital clock widget that displays the current time and date in a specified time zone.
         * It is based on the utctime.info website.
         * http://utctime.info/
         * Version: 0.6.0
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
        const googleFontsMonospace = (0, _dataYamlDefault.default)?.allowFonts ?? [];
        class SimpleDigitalClockWidget extends (0, _preact.Component) {
          constructor(props) {
            (super(props),
              (this.containerRef = null),
              (this.zoneContainerRef = null),
              (this.dateContainerRef = null),
              (this.loadGoogleFont = (fontFamily) => {
                if (fontFamily) {
                  const link = document.createElement("link");
                  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s/g, "+")}:wght@700&display=swap`;
                  link.rel = "stylesheet";
                  document.head.appendChild(link);
                }
              }),
              (this.handlePrefers = () => {
                const backgroundColor =
                  this.props.prefers === undefined ||
                  this.props.prefers === null ||
                  this.props.prefers === "" ||
                  this.props.prefers === "system" ||
                  this.props.prefers === "auto"
                    ? (0, _isDarkDefault.default)()
                      ? "#000000"
                      : "#ffffff"
                    : this.props.prefers === "dark"
                      ? "#000000"
                      : "#ffffff";
                this.setState({
                  backgroundColor,
                });
                // console.log(this.props.prefers, "prefers");
              }),
              (this.handleResize = () => {
                if (this.containerRef) {
                  const localeList = ["bg", "ko"];
                  const currentLocale = this.props.locale || "en"; // Replace this with your actual locale string
                  const isLocaleMatch = localeList.some((prefix) =>
                    currentLocale.startsWith(prefix)
                  );
                  const fontSizeByLocale = isLocaleMatch ? 8 : 7;
                  const width = this.containerRef.offsetWidth;
                  const fontSize = (width || 1) / fontSizeByLocale;
                  const fontSizeTitle = (width || 1) / 15;
                  this.setState({
                    fontSize,
                    fontSizeTitle,
                  });
                }
              }),
              /**
               * Updates the time and date strings based on the current locale, timeZone, seconds, and period props.
               * Sets the state with the updated timeString, dateString, timeZoneName, and isError values.
               */ (this.updateTimeAndDateString = () => {
                const { locale, timeZone, second, period } = this.props;
                const date = new Date();
                let isDay = true;
                let timeString = "";
                let dateString = "";
                let timeZoneName = "";
                let isError = false;
                // console.log(period !== undefined && { hour12: true });
                const currentHour = date.getHours();
                isDay = currentHour >= 6 && currentHour < 18;
                try {
                  timeString = date.toLocaleTimeString(locale, {
                    timeZone,
                    hour: "numeric",
                    minute: "numeric",
                    ...(second !== undefined
                      ? {
                          second: "numeric",
                        }
                      : {}),
                    ...(period !== undefined
                      ? {
                          hour12: true,
                        }
                      : {}),
                  });
                  dateString = date.toLocaleDateString(locale, {
                    timeZone,
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });
                  timeZoneName = date.toLocaleDateString(locale, {
                    timeZone,
                    timeZoneName:
                      this.props.timeZoneName === "" ? undefined : this.props.timeZoneName,
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
                  isError,
                });
              }));
            this.interval;
            this.state = {
              isDay: true,
              isError: false,
              timeString: "",
              dateString: "",
              timeZoneName: "",
              fontSize: 16,
              fontSizeTitle: 16,
              backgroundColor: "#ffffff",
            };
          }
          static {
            this.tagName = "timenow-zone-sdcw";
          }
          static {
            // Observe attributes in kebab-case (HTML side)
            this.observedAttributes = [
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
              "width",
              "align",
            ];
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
            if (prevProps.fontFamily !== this.props.fontFamily)
              this.loadGoogleFont(this.props.fontFamily);
            if (prevProps.width !== this.props.width) this.handleResize();
            if (prevProps.prefers !== this.props.prefers) this.handlePrefers();
          }
          componentWillUnmount() {
            // console.log("componentWillUnmount");
            clearInterval(this.interval);
          }
          render() {
            const {
              backgroundColor,
              background,
              fontFamily,
              caption,
              rounded,
              shadow,
              border,
              width,
              align,
              date,
            } = this.props;
            const showDate = date !== undefined;
            const showCaption = caption || false;
            const mainDivClasses = ["widget", "font-family"];
            if (shadow) mainDivClasses.push(shadow);
            const mainStyle = {
              color: (0, _contrastColorDefault.default)(
                backgroundColor?.toLowerCase() || this.state.backgroundColor
              ),
              ...(background
                ? {
                    background: background?.toLowerCase() || this.state.backgroundColor,
                  }
                : {
                    backgroundColor: backgroundColor?.toLowerCase(),
                  }),
            };
            const fontStyles = {
              fontFamily: googleFontsMonospace.some((element) => element === fontFamily)
                ? this.props.fontFamily
                : "monospace",
            };
            return /*#__PURE__*/ (0, _preact.h)(
              (0, _preact.Fragment),
              {
                __source: {
                  fileName: "src/SimpleDigitalClockWidget.tsx",
                  lineNumber: 270,
                  columnNumber: 7,
                },
                __self: this,
              },
              /*#__PURE__*/ (0, _preact.h)(
                "style",
                {
                  __source: {
                    fileName: "src/SimpleDigitalClockWidget.tsx",
                    lineNumber: 271,
                    columnNumber: 9,
                  },
                  __self: this,
                },
                (0, _stylesCssDefault.default)
              ),
              /*#__PURE__*/ (0, _preact.h)(
                "div",
                {
                  "data-version": v,
                  className: (0, _clsxDefault.default)(mainDivClasses),
                  ref: (el) => {
                    this.containerRef = el;
                  },
                  style: {
                    ...mainStyle,
                    ...(rounded !== undefined && {
                      borderRadius: `${rounded}rem`,
                    }),
                    ...(border !== undefined && {
                      borderColor: (0, _darkenColorDefault.default)(
                        backgroundColor?.toLowerCase() || this.state.backgroundColor,
                        -0.25
                      ),
                      borderWidth: "1px",
                    }),
                    transition: "background 1s ease",
                    position: "relative",
                    minWidth: 80,
                    ...(width !== undefined && {
                      width: parseInt(width?.toString() || "80", 10) || undefined,
                    }),
                  },
                  __source: {
                    fileName: "src/SimpleDigitalClockWidget.tsx",
                    lineNumber: 272,
                    columnNumber: 9,
                  },
                  __self: this,
                },
                /*#__PURE__*/ (0, _preact.h)(
                  "div",
                  {
                    className: (0, _clsxDefault.default)(`text-${align || "center"}`),
                    __source: {
                      fileName: "src/SimpleDigitalClockWidget.tsx",
                      lineNumber: 296,
                      columnNumber: 11,
                    },
                    __self: this,
                  },
                  this.state.timeString
                    ? /*#__PURE__*/ (0, _preact.h)(
                        (0, _preact.Fragment),
                        {
                          __source: {
                            fileName: "src/SimpleDigitalClockWidget.tsx",
                            lineNumber: 298,
                            columnNumber: 15,
                          },
                          __self: this,
                        },
                        showCaption &&
                          /*#__PURE__*/ (0, _preact.h)(
                            "div",
                            {
                              style: {
                                fontSize: this.state.fontSizeTitle,
                              },
                              __source: {
                                fileName: "src/SimpleDigitalClockWidget.tsx",
                                lineNumber: 299,
                                columnNumber: 33,
                              },
                              __self: this,
                            },
                            caption
                          ),
                        /*#__PURE__*/ (0, _preact.h)(
                          "a",
                          {
                            title: this.state.timeZoneName,
                            style: {
                              fontSize: this.state.fontSize,
                              ...fontStyles,
                            },
                            href: "https://utctime.info/",
                            target: "_blank",
                            rel: "noopener noreferrer",
                            __source: {
                              fileName: "src/SimpleDigitalClockWidget.tsx",
                              lineNumber: 300,
                              columnNumber: 17,
                            },
                            __self: this,
                          },
                          this.state.timeString
                        ),
                        showDate &&
                          /*#__PURE__*/ (0, _preact.h)(
                            (0, _preact.Fragment),
                            {
                              __source: {
                                fileName: "src/SimpleDigitalClockWidget.tsx",
                                lineNumber: 310,
                                columnNumber: 19,
                              },
                              __self: this,
                            },
                            /*#__PURE__*/ (0, _preact.h)(
                              "div",
                              {
                                title: this.state.timeZoneName,
                                ref: (el) => {
                                  this.dateContainerRef = el;
                                },
                                onClick: () => {
                                  this.zoneContainerRef?.style.setProperty("display", "block");
                                  this.dateContainerRef?.style.setProperty("display", "none");
                                },
                                style: {
                                  fontSize: this.state.fontSizeTitle,
                                  cursor: "pointer",
                                },
                                __source: {
                                  fileName: "src/SimpleDigitalClockWidget.tsx",
                                  lineNumber: 311,
                                  columnNumber: 21,
                                },
                                __self: this,
                              },
                              this.state.dateString
                            ),
                            /*#__PURE__*/ (0, _preact.h)(
                              "div",
                              {
                                title: this.state.dateString,
                                onClick: () => {
                                  this.zoneContainerRef?.style.setProperty("display", "none");
                                  this.dateContainerRef?.style.setProperty("display", "block");
                                },
                                ref: (el) => {
                                  this.zoneContainerRef = el;
                                },
                                style: {
                                  fontSize: this.state.fontSizeTitle,
                                  display: "none",
                                  cursor: "pointer",
                                },
                                __source: {
                                  fileName: "src/SimpleDigitalClockWidget.tsx",
                                  lineNumber: 327,
                                  columnNumber: 21,
                                },
                                __self: this,
                              },
                              this.state.timeZoneName
                            )
                          )
                      )
                    : /*#__PURE__*/ (0, _preact.h)((0, _preact.Fragment), null, "..."),
                  this.state.isError &&
                    /*#__PURE__*/ (0, _preact.h)(
                      "div",
                      {
                        __source: {
                          fileName: "src/SimpleDigitalClockWidget.tsx",
                          lineNumber: 350,
                          columnNumber: 36,
                        },
                        __self: this,
                      },
                      "Error, please check attributes of tag."
                    )
                )
              )
            );
          }
        }
        exports.default = SimpleDigitalClockWidget;
        (0, _preactCustomElementDefault.default)(SimpleDigitalClockWidget, undefined, undefined, {
          shadow: true,
        });
      },
      {
        preact: "agj7k",
        "preact-custom-element": "goRcR",
        clsx: "dOSJC",
        "bundle-text:./styles.css": "212U3",
        "./contrastColor": "4LQ2d",
        "./darkenColor": "bVzki",
        "./data.yaml": "gVCft",
        "./isDark": "fhVkf",
        "@parcel/transformer-js/src/esmodule-helpers.js": "jnFvT",
      },
    ],
    agj7k: [
      function (require, module, exports, __globalThis) {
        var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
        parcelHelpers.defineInteropFlag(exports);
        parcelHelpers.export(exports, "Component", () => x);
        parcelHelpers.export(exports, "Fragment", () => k);
        parcelHelpers.export(exports, "cloneElement", () => K);
        parcelHelpers.export(exports, "createContext", () => Q);
        parcelHelpers.export(exports, "createElement", () => _);
        parcelHelpers.export(exports, "createRef", () => b);
        parcelHelpers.export(exports, "h", () => _);
        parcelHelpers.export(exports, "hydrate", () => J);
        parcelHelpers.export(exports, "isValidElement", () => t);
        parcelHelpers.export(exports, "options", () => l);
        parcelHelpers.export(exports, "render", () => G);
        parcelHelpers.export(exports, "toChildArray", () => H);
        var n,
          l,
          u,
          t,
          i,
          r,
          o,
          e,
          f,
          c,
          s,
          a,
          h,
          p = {},
          v = [],
          y = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,
          w = Array.isArray;
        function d(n, l) {
          for (var u in l) n[u] = l[u];
          return n;
        }
        function g(n) {
          n && n.parentNode && n.parentNode.removeChild(n);
        }
        function _(l, u, t) {
          var i,
            r,
            o,
            e = {};
          for (o in u) "key" == o ? (i = u[o]) : "ref" == o ? (r = u[o]) : (e[o] = u[o]);
          if (
            (arguments.length > 2 && (e.children = arguments.length > 3 ? n.call(arguments, 2) : t),
            "function" == typeof l && null != l.defaultProps)
          )
            for (o in l.defaultProps) void 0 === e[o] && (e[o] = l.defaultProps[o]);
          return m(l, e, i, r, null);
        }
        function m(n, t, i, r, o) {
          var e = {
            type: n,
            props: t,
            key: i,
            ref: r,
            __k: null,
            __: null,
            __b: 0,
            __e: null,
            __c: null,
            constructor: void 0,
            __v: null == o ? ++u : o,
            __i: -1,
            __u: 0,
          };
          return (null == o && null != l.vnode && l.vnode(e), e);
        }
        function b() {
          return {
            current: null,
          };
        }
        function k(n) {
          return n.children;
        }
        function x(n, l) {
          ((this.props = n), (this.context = l));
        }
        function S(n, l) {
          if (null == l) return n.__ ? S(n.__, n.__i + 1) : null;
          for (var u; l < n.__k.length; l++)
            if (null != (u = n.__k[l]) && null != u.__e) return u.__e;
          return "function" == typeof n.type ? S(n) : null;
        }
        function C(n) {
          var l, u;
          if (null != (n = n.__) && null != n.__c) {
            for (n.__e = n.__c.base = null, l = 0; l < n.__k.length; l++)
              if (null != (u = n.__k[l]) && null != u.__e) {
                n.__e = n.__c.base = u.__e;
                break;
              }
            return C(n);
          }
        }
        function M(n) {
          ((!n.__d && (n.__d = !0) && i.push(n) && !$.__r++) || r != l.debounceRendering) &&
            ((r = l.debounceRendering) || o)($);
        }
        function $() {
          for (var n, u, t, r, o, f, c, s = 1; i.length; )
            (i.length > s && i.sort(e),
              (n = i.shift()),
              (s = i.length),
              n.__d &&
                ((t = void 0),
                (r = void 0),
                (o = (r = (u = n).__v).__e),
                (f = []),
                (c = []),
                u.__P &&
                  (((t = d({}, r)).__v = r.__v + 1),
                  l.vnode && l.vnode(t),
                  O(
                    u.__P,
                    t,
                    r,
                    u.__n,
                    u.__P.namespaceURI,
                    32 & r.__u ? [o] : null,
                    f,
                    null == o ? S(r) : o,
                    !!(32 & r.__u),
                    c
                  ),
                  (t.__v = r.__v),
                  (t.__.__k[t.__i] = t),
                  N(f, t, c),
                  (r.__e = r.__ = null),
                  t.__e != o && C(t))));
          $.__r = 0;
        }
        function I(n, l, u, t, i, r, o, e, f, c, s) {
          var a,
            h,
            y,
            w,
            d,
            g,
            _,
            m = (t && t.__k) || v,
            b = l.length;
          for (f = P(u, l, m, f, b), a = 0; a < b; a++)
            null != (y = u.__k[a]) &&
              ((h = -1 == y.__i ? p : m[y.__i] || p),
              (y.__i = a),
              (g = O(n, y, h, i, r, o, e, f, c, s)),
              (w = y.__e),
              y.ref && h.ref != y.ref && (h.ref && B(h.ref, null, y), s.push(y.ref, y.__c || w, y)),
              null == d && null != w && (d = w),
              (_ = !!(4 & y.__u)) || h.__k === y.__k
                ? (f = A(y, f, n, _))
                : "function" == typeof y.type && void 0 !== g
                  ? (f = g)
                  : w && (f = w.nextSibling),
              (y.__u &= -7));
          return ((u.__e = d), f);
        }
        function P(n, l, u, t, i) {
          var r,
            o,
            e,
            f,
            c,
            s = u.length,
            a = s,
            h = 0;
          for (n.__k = new Array(i), r = 0; r < i; r++)
            null != (o = l[r]) && "boolean" != typeof o && "function" != typeof o
              ? ((f = r + h),
                ((o = n.__k[r] =
                  "string" == typeof o ||
                  "number" == typeof o ||
                  "bigint" == typeof o ||
                  o.constructor == String
                    ? m(null, o, null, null, null)
                    : w(o)
                      ? m(
                          k,
                          {
                            children: o,
                          },
                          null,
                          null,
                          null
                        )
                      : null == o.constructor && o.__b > 0
                        ? m(o.type, o.props, o.key, o.ref ? o.ref : null, o.__v)
                        : o).__ = n),
                (o.__b = n.__b + 1),
                (e = null),
                -1 != (c = o.__i = L(o, u, f, a)) && (a--, (e = u[c]) && (e.__u |= 2)),
                null == e || null == e.__v
                  ? (-1 == c && (i > s ? h-- : i < s && h++),
                    "function" != typeof o.type && (o.__u |= 4))
                  : c != f &&
                    (c == f - 1 ? h-- : c == f + 1 ? h++ : (c > f ? h-- : h++, (o.__u |= 4))))
              : (n.__k[r] = null);
          if (a)
            for (r = 0; r < s; r++)
              null != (e = u[r]) && 0 == (2 & e.__u) && (e.__e == t && (t = S(e)), D(e, e));
          return t;
        }
        function A(n, l, u, t) {
          var i, r;
          if ("function" == typeof n.type) {
            for (i = n.__k, r = 0; i && r < i.length; r++)
              i[r] && ((i[r].__ = n), (l = A(i[r], l, u, t)));
            return l;
          }
          n.__e != l &&
            (t && (l && n.type && !l.parentNode && (l = S(n)), u.insertBefore(n.__e, l || null)),
            (l = n.__e));
          do l = l && l.nextSibling;
          while (null != l && 8 == l.nodeType);
          return l;
        }
        function H(n, l) {
          return (
            (l = l || []),
            null == n ||
              "boolean" == typeof n ||
              (w(n)
                ? n.some(function (n) {
                    H(n, l);
                  })
                : l.push(n)),
            l
          );
        }
        function L(n, l, u, t) {
          var i,
            r,
            o,
            e = n.key,
            f = n.type,
            c = l[u],
            s = null != c && 0 == (2 & c.__u);
          if ((null === c && null == n.key) || (s && e == c.key && f == c.type)) return u;
          if (t > (s ? 1 : 0)) {
            for (i = u - 1, r = u + 1; i >= 0 || r < l.length; )
              if (
                null != (c = l[(o = i >= 0 ? i-- : r++)]) &&
                0 == (2 & c.__u) &&
                e == c.key &&
                f == c.type
              )
                return o;
          }
          return -1;
        }
        function T(n, l, u) {
          "-" == l[0]
            ? n.setProperty(l, null == u ? "" : u)
            : (n[l] = null == u ? "" : "number" != typeof u || y.test(l) ? u : u + "px");
        }
        function j(n, l, u, t, i) {
          var r, o;
          n: if ("style" == l) {
            if ("string" == typeof u) n.style.cssText = u;
            else {
              if (("string" == typeof t && (n.style.cssText = t = ""), t))
                for (l in t) (u && l in u) || T(n.style, l, "");
              if (u) for (l in u) (t && u[l] == t[l]) || T(n.style, l, u[l]);
            }
          } else if ("o" == l[0] && "n" == l[1])
            ((r = l != (l = l.replace(f, "$1"))),
              (o = l.toLowerCase()),
              (l = o in n || "onFocusOut" == l || "onFocusIn" == l ? o.slice(2) : l.slice(2)),
              n.l || (n.l = {}),
              (n.l[l + r] = u),
              u
                ? t
                  ? (u.u = t.u)
                  : ((u.u = c), n.addEventListener(l, r ? a : s, r))
                : n.removeEventListener(l, r ? a : s, r));
          else {
            if ("http://www.w3.org/2000/svg" == i)
              l = l.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
            else if (
              "width" != l &&
              "height" != l &&
              "href" != l &&
              "list" != l &&
              "form" != l &&
              "tabIndex" != l &&
              "download" != l &&
              "rowSpan" != l &&
              "colSpan" != l &&
              "role" != l &&
              "popover" != l &&
              l in n
            )
              try {
                n[l] = null == u ? "" : u;
                break n;
              } catch (n) {}
            "function" == typeof u ||
              (null == u || (!1 === u && "-" != l[4])
                ? n.removeAttribute(l)
                : n.setAttribute(l, "popover" == l && 1 == u ? "" : u));
          }
        }
        function F(n) {
          return function (u) {
            if (this.l) {
              var t = this.l[u.type + n];
              if (null == u.t) u.t = c++;
              else if (u.t < t.u) return;
              return t(l.event ? l.event(u) : u);
            }
          };
        }
        function O(n, u, t, i, r, o, e, f, c, s) {
          var a,
            h,
            p,
            v,
            y,
            _,
            m,
            b,
            S,
            C,
            M,
            $,
            P,
            A,
            H,
            L,
            T,
            j = u.type;
          if (null != u.constructor) return null;
          (128 & t.__u && ((c = !!(32 & t.__u)), (o = [(f = u.__e = t.__e)])), (a = l.__b) && a(u));
          n: if ("function" == typeof j)
            try {
              if (
                ((b = u.props),
                (S = "prototype" in j && j.prototype.render),
                (C = (a = j.contextType) && i[a.__c]),
                (M = a ? (C ? C.props.value : a.__) : i),
                t.__c
                  ? (m = (h = u.__c = t.__c).__ = h.__E)
                  : (S
                      ? (u.__c = h = new j(b, M))
                      : ((u.__c = h = new x(b, M)), (h.constructor = j), (h.render = E)),
                    C && C.sub(h),
                    (h.props = b),
                    h.state || (h.state = {}),
                    (h.context = M),
                    (h.__n = i),
                    (p = h.__d = !0),
                    (h.__h = []),
                    (h._sb = [])),
                S && null == h.__s && (h.__s = h.state),
                S &&
                  null != j.getDerivedStateFromProps &&
                  (h.__s == h.state && (h.__s = d({}, h.__s)),
                  d(h.__s, j.getDerivedStateFromProps(b, h.__s))),
                (v = h.props),
                (y = h.state),
                (h.__v = u),
                p)
              )
                (S &&
                  null == j.getDerivedStateFromProps &&
                  null != h.componentWillMount &&
                  h.componentWillMount(),
                  S && null != h.componentDidMount && h.__h.push(h.componentDidMount));
              else {
                if (
                  (S &&
                    null == j.getDerivedStateFromProps &&
                    b !== v &&
                    null != h.componentWillReceiveProps &&
                    h.componentWillReceiveProps(b, M),
                  (!h.__e &&
                    null != h.shouldComponentUpdate &&
                    !1 === h.shouldComponentUpdate(b, h.__s, M)) ||
                    u.__v == t.__v)
                ) {
                  for (
                    u.__v != t.__v && ((h.props = b), (h.state = h.__s), (h.__d = !1)),
                      u.__e = t.__e,
                      u.__k = t.__k,
                      u.__k.some(function (n) {
                        n && (n.__ = u);
                      }),
                      $ = 0;
                    $ < h._sb.length;
                    $++
                  )
                    h.__h.push(h._sb[$]);
                  ((h._sb = []), h.__h.length && e.push(h));
                  break n;
                }
                (null != h.componentWillUpdate && h.componentWillUpdate(b, h.__s, M),
                  S &&
                    null != h.componentDidUpdate &&
                    h.__h.push(function () {
                      h.componentDidUpdate(v, y, _);
                    }));
              }
              if (
                ((h.context = M), (h.props = b), (h.__P = n), (h.__e = !1), (P = l.__r), (A = 0), S)
              ) {
                for (
                  h.state = h.__s,
                    h.__d = !1,
                    P && P(u),
                    a = h.render(h.props, h.state, h.context),
                    H = 0;
                  H < h._sb.length;
                  H++
                )
                  h.__h.push(h._sb[H]);
                h._sb = [];
              } else
                do
                  ((h.__d = !1),
                    P && P(u),
                    (a = h.render(h.props, h.state, h.context)),
                    (h.state = h.__s));
                while (h.__d && ++A < 25);
              ((h.state = h.__s),
                null != h.getChildContext && (i = d(d({}, i), h.getChildContext())),
                S &&
                  !p &&
                  null != h.getSnapshotBeforeUpdate &&
                  (_ = h.getSnapshotBeforeUpdate(v, y)),
                (L = a),
                null != a && a.type === k && null == a.key && (L = V(a.props.children)),
                (f = I(n, w(L) ? L : [L], u, t, i, r, o, e, f, c, s)),
                (h.base = u.__e),
                (u.__u &= -161),
                h.__h.length && e.push(h),
                m && (h.__E = h.__ = null));
            } catch (n) {
              if (((u.__v = null), c || null != o)) {
                if (n.then) {
                  for (u.__u |= c ? 160 : 128; f && 8 == f.nodeType && f.nextSibling; )
                    f = f.nextSibling;
                  ((o[o.indexOf(f)] = null), (u.__e = f));
                } else {
                  for (T = o.length; T--; ) g(o[T]);
                  z(u);
                }
              } else ((u.__e = t.__e), (u.__k = t.__k), n.then || z(u));
              l.__e(n, u, t);
            }
          else
            null == o && u.__v == t.__v
              ? ((u.__k = t.__k), (u.__e = t.__e))
              : (f = u.__e = q(t.__e, u, t, i, r, o, e, c, s));
          return ((a = l.diffed) && a(u), 128 & u.__u ? void 0 : f);
        }
        function z(n) {
          (n && n.__c && (n.__c.__e = !0), n && n.__k && n.__k.forEach(z));
        }
        function N(n, u, t) {
          for (var i = 0; i < t.length; i++) B(t[i], t[++i], t[++i]);
          (l.__c && l.__c(u, n),
            n.some(function (u) {
              try {
                ((n = u.__h),
                  (u.__h = []),
                  n.some(function (n) {
                    n.call(u);
                  }));
              } catch (n) {
                l.__e(n, u.__v);
              }
            }));
        }
        function V(n) {
          return "object" != typeof n || null == n || (n.__b && n.__b > 0)
            ? n
            : w(n)
              ? n.map(V)
              : d({}, n);
        }
        function q(u, t, i, r, o, e, f, c, s) {
          var a,
            h,
            v,
            y,
            d,
            _,
            m,
            b = i.props,
            k = t.props,
            x = t.type;
          if (
            ("svg" == x
              ? (o = "http://www.w3.org/2000/svg")
              : "math" == x
                ? (o = "http://www.w3.org/1998/Math/MathML")
                : o || (o = "http://www.w3.org/1999/xhtml"),
            null != e)
          ) {
            for (a = 0; a < e.length; a++)
              if (
                (d = e[a]) &&
                "setAttribute" in d == !!x &&
                (x ? d.localName == x : 3 == d.nodeType)
              ) {
                ((u = d), (e[a] = null));
                break;
              }
          }
          if (null == u) {
            if (null == x) return document.createTextNode(k);
            ((u = document.createElementNS(o, x, k.is && k)),
              c && (l.__m && l.__m(t, e), (c = !1)),
              (e = null));
          }
          if (null == x) b === k || (c && u.data == k) || (u.data = k);
          else {
            if (((e = e && n.call(u.childNodes)), (b = i.props || p), !c && null != e))
              for (b = {}, a = 0; a < u.attributes.length; a++)
                b[(d = u.attributes[a]).name] = d.value;
            for (a in b)
              if (((d = b[a]), "children" == a));
              else if ("dangerouslySetInnerHTML" == a) v = d;
              else if (!(a in k)) {
                if (
                  ("value" == a && "defaultValue" in k) ||
                  ("checked" == a && "defaultChecked" in k)
                )
                  continue;
                j(u, a, null, d, o);
              }
            for (a in k)
              ((d = k[a]),
                "children" == a
                  ? (y = d)
                  : "dangerouslySetInnerHTML" == a
                    ? (h = d)
                    : "value" == a
                      ? (_ = d)
                      : "checked" == a
                        ? (m = d)
                        : (c && "function" != typeof d) || b[a] === d || j(u, a, d, b[a], o));
            if (h)
              (c ||
                (v && (h.__html == v.__html || h.__html == u.innerHTML)) ||
                (u.innerHTML = h.__html),
                (t.__k = []));
            else if (
              (v && (u.innerHTML = ""),
              I(
                "template" == t.type ? u.content : u,
                w(y) ? y : [y],
                t,
                i,
                r,
                "foreignObject" == x ? "http://www.w3.org/1999/xhtml" : o,
                e,
                f,
                e ? e[0] : i.__k && S(i, 0),
                c,
                s
              ),
              null != e)
            )
              for (a = e.length; a--; ) g(e[a]);
            c ||
              ((a = "value"),
              "progress" == x && null == _
                ? u.removeAttribute("value")
                : null != _ &&
                  (_ !== u[a] || ("progress" == x && !_) || ("option" == x && _ != b[a])) &&
                  j(u, a, _, b[a], o),
              (a = "checked"),
              null != m && m != u[a] && j(u, a, m, b[a], o));
          }
          return u;
        }
        function B(n, u, t) {
          try {
            if ("function" == typeof n) {
              var i = "function" == typeof n.__u;
              (i && n.__u(), (i && null == u) || (n.__u = n(u)));
            } else n.current = u;
          } catch (n) {
            l.__e(n, t);
          }
        }
        function D(n, u, t) {
          var i, r;
          if (
            (l.unmount && l.unmount(n),
            (i = n.ref) && ((i.current && i.current != n.__e) || B(i, null, u)),
            null != (i = n.__c))
          ) {
            if (i.componentWillUnmount)
              try {
                i.componentWillUnmount();
              } catch (n) {
                l.__e(n, u);
              }
            i.base = i.__P = null;
          }
          if ((i = n.__k))
            for (r = 0; r < i.length; r++) i[r] && D(i[r], u, t || "function" != typeof n.type);
          (t || g(n.__e), (n.__c = n.__ = n.__e = void 0));
        }
        function E(n, l, u) {
          return this.constructor(n, u);
        }
        function G(u, t, i) {
          var r, o, e, f;
          (t == document && (t = document.documentElement),
            l.__ && l.__(u, t),
            (o = (r = "function" == typeof i) ? null : (i && i.__k) || t.__k),
            (e = []),
            (f = []),
            O(
              t,
              (u = ((!r && i) || t).__k = _(k, null, [u])),
              o || p,
              p,
              t.namespaceURI,
              !r && i ? [i] : o ? null : t.firstChild ? n.call(t.childNodes) : null,
              e,
              !r && i ? i : o ? o.__e : t.firstChild,
              r,
              f
            ),
            N(e, u, f));
        }
        function J(n, l) {
          G(n, l, J);
        }
        function K(l, u, t) {
          var i,
            r,
            o,
            e,
            f = d({}, l.props);
          for (o in (l.type && l.type.defaultProps && (e = l.type.defaultProps), u))
            "key" == o
              ? (i = u[o])
              : "ref" == o
                ? (r = u[o])
                : (f[o] = void 0 === u[o] && null != e ? e[o] : u[o]);
          return (
            arguments.length > 2 && (f.children = arguments.length > 3 ? n.call(arguments, 2) : t),
            m(l.type, f, i || l.key, r || l.ref, null)
          );
        }
        function Q(n) {
          function l(n) {
            var u, t;
            return (
              this.getChildContext ||
                ((u = new Set()),
                ((t = {})[l.__c] = this),
                (this.getChildContext = function () {
                  return t;
                }),
                (this.componentWillUnmount = function () {
                  u = null;
                }),
                (this.shouldComponentUpdate = function (n) {
                  this.props.value != n.value &&
                    u.forEach(function (n) {
                      ((n.__e = !0), M(n));
                    });
                }),
                (this.sub = function (n) {
                  u.add(n);
                  var l = n.componentWillUnmount;
                  n.componentWillUnmount = function () {
                    (u && u.delete(n), l && l.call(n));
                  };
                })),
              n.children
            );
          }
          return (
            (l.__c = "__cC" + h++),
            (l.__ = n),
            (l.Provider =
              l.__l =
              (l.Consumer = function (n, l) {
                return n.children(l);
              }).contextType =
                l),
            l
          );
        }
        ((n = v.slice),
          (l = {
            __e: function (n, l, u, t) {
              for (var i, r, o; (l = l.__); )
                if ((i = l.__c) && !i.__)
                  try {
                    if (
                      ((r = i.constructor) &&
                        null != r.getDerivedStateFromError &&
                        (i.setState(r.getDerivedStateFromError(n)), (o = i.__d)),
                      null != i.componentDidCatch && (i.componentDidCatch(n, t || {}), (o = i.__d)),
                      o)
                    )
                      return (i.__E = i);
                  } catch (l) {
                    n = l;
                  }
              throw n;
            },
          }),
          (u = 0),
          (t = function (n) {
            return null != n && null == n.constructor;
          }),
          (x.prototype.setState = function (n, l) {
            var u;
            ((u =
              null != this.__s && this.__s != this.state
                ? this.__s
                : (this.__s = d({}, this.state))),
              "function" == typeof n && (n = n(d({}, u), this.props)),
              n && d(u, n),
              null != n && this.__v && (l && this._sb.push(l), M(this)));
          }),
          (x.prototype.forceUpdate = function (n) {
            this.__v && ((this.__e = !0), n && this.__h.push(n), M(this));
          }),
          (x.prototype.render = k),
          (i = []),
          (o =
            "function" == typeof Promise
              ? Promise.prototype.then.bind(Promise.resolve())
              : setTimeout),
          (e = function (n, l) {
            return n.__v.__b - l.__v.__b;
          }),
          ($.__r = 0),
          (f = /(PointerCapture)$|Capture$/i),
          (c = 0),
          (s = F(!1)),
          (a = F(!0)),
          (h = 0));
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "jnFvT" },
    ],
    jnFvT: [
      function (require, module, exports, __globalThis) {
        exports.interopDefault = function (a) {
          return a && a.__esModule
            ? a
            : {
                default: a,
              };
        };
        exports.defineInteropFlag = function (a) {
          Object.defineProperty(a, "__esModule", {
            value: true,
          });
        };
        exports.exportAll = function (source, dest) {
          Object.keys(source).forEach(function (key) {
            if (
              key === "default" ||
              key === "__esModule" ||
              Object.prototype.hasOwnProperty.call(dest, key)
            )
              return;
            Object.defineProperty(dest, key, {
              enumerable: true,
              get: function () {
                return source[key];
              },
            });
          });
          return dest;
        };
        exports.export = function (dest, destName, get) {
          Object.defineProperty(dest, destName, {
            enumerable: true,
            get: get,
          });
        };
      },
      {},
    ],
    goRcR: [
      function (require, module, exports, __globalThis) {
        var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
        parcelHelpers.defineInteropFlag(exports);
        parcelHelpers.export(exports, "default", () => l);
        var _preact = require("preact");
        function i() {
          return (
            (i = Object.assign
              ? Object.assign.bind()
              : function (t) {
                  for (var e = 1; e < arguments.length; e++) {
                    var n = arguments[e];
                    for (var o in n) Object.prototype.hasOwnProperty.call(n, o) && (t[o] = n[o]);
                  }
                  return t;
                }),
            i.apply(this, arguments)
          );
        }
        function s(t, e) {
          if (null == t) return {};
          var n,
            o,
            r = {},
            i = Object.keys(t);
          for (o = 0; o < i.length; o++) e.indexOf((n = i[o])) >= 0 || (r[n] = t[n]);
          return r;
        }
        var a = ["context", "children"],
          c = ["useFragment"];
        function l(t, e, n, o) {
          function r() {
            var e = Reflect.construct(HTMLElement, [], r);
            return (
              (e._vdomComponent = t),
              (e._root =
                o && o.shadow
                  ? e.attachShadow({
                      mode: o.mode || "open",
                    })
                  : e),
              o && o.adoptedStyleSheets && (e._root.adoptedStyleSheets = o.adoptedStyleSheets),
              e
            );
          }
          return (
            ((r.prototype = Object.create(HTMLElement.prototype)).constructor = r),
            (r.prototype.connectedCallback = function () {
              d.call(this, o);
            }),
            (r.prototype.attributeChangedCallback = h),
            (r.prototype.disconnectedCallback = f),
            (n = n || t.observedAttributes || Object.keys(t.propTypes || {})),
            (r.observedAttributes = n),
            t.formAssociated && (r.formAssociated = !0),
            n.forEach(function (t) {
              Object.defineProperty(r.prototype, t, {
                get: function () {
                  return this._vdom ? this._vdom.props[t] : this._props[t];
                },
                set: function (e) {
                  this._vdom
                    ? this.attributeChangedCallback(t, null, e)
                    : (this._props || (this._props = {}), (this._props[t] = e));
                  var n = typeof e;
                  (null != e && "string" !== n && "boolean" !== n && "number" !== n) ||
                    this.setAttribute(t, e);
                },
              });
            }),
            customElements.define(e || t.tagName || t.displayName || t.name, r),
            r
          );
        }
        function u(t) {
          this.getChildContext = function () {
            return t.context;
          };
          var e = t.children,
            n = s(t, a);
          return (0, _preact.cloneElement)(e, n);
        }
        function d(o) {
          var r = new CustomEvent("_preact", {
            detail: {},
            bubbles: !0,
            cancelable: !0,
          });
          (this.dispatchEvent(r),
            (this._vdom = (0, _preact.h)(
              u,
              i({}, this._props, {
                context: r.detail.context,
              }),
              v(this, this._vdomComponent, o)
            )),
            (this.hasAttribute("hydrate") ? (0, _preact.hydrate) : (0, _preact.render))(
              this._vdom,
              this._root
            ));
        }
        function p(t) {
          return t.replace(/-(\w)/g, function (t, e) {
            return e ? e.toUpperCase() : "";
          });
        }
        function h(t, e, r) {
          if (this._vdom) {
            var i = {};
            ((i[t] = r = null == r ? void 0 : r),
              (i[p(t)] = r),
              (this._vdom = (0, _preact.cloneElement)(this._vdom, i)),
              (0, _preact.render)(this._vdom, this._root));
          }
        }
        function f() {
          (0, _preact.render)((this._vdom = null), this._root);
        }
        function m(e, n) {
          var o = this,
            a = e.useFragment,
            l = s(e, c);
          return (0, _preact.h)(
            a ? (0, _preact.Fragment) : "slot",
            i({}, l, {
              ref: function (t) {
                t
                  ? ((o.ref = t),
                    o._listener ||
                      ((o._listener = function (t) {
                        (t.stopPropagation(), (t.detail.context = n));
                      }),
                      t.addEventListener("_preact", o._listener)))
                  : o.ref.removeEventListener("_preact", o._listener);
              },
            })
          );
        }
        function v(e, n, o) {
          if (3 === e.nodeType) return e.data;
          if (1 !== e.nodeType) return null;
          var r = [],
            i = {},
            s = 0,
            a = e.attributes,
            c = e.childNodes;
          for (s = a.length; s--; )
            "slot" !== a[s].name && ((i[a[s].name] = a[s].value), (i[p(a[s].name)] = a[s].value));
          for (s = c.length; s--; ) {
            var l = v(c[s], null, o),
              u = c[s].slot;
            u
              ? (i[u] = (0, _preact.h)(
                  m,
                  {
                    name: u,
                  },
                  l
                ))
              : (r[s] = l);
          }
          var d = !(!o || !o.shadow),
            h = n
              ? (0, _preact.h)(
                  m,
                  {
                    useFragment: !d,
                  },
                  r
                )
              : r;
          return (
            !d && n && (e.innerHTML = ""),
            (0, _preact.h)(n || e.nodeName.toLowerCase(), i, h)
          );
        }
      },
      { preact: "agj7k", "@parcel/transformer-js/src/esmodule-helpers.js": "jnFvT" },
    ],
    dOSJC: [
      function (require, module, exports, __globalThis) {
        var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
        parcelHelpers.defineInteropFlag(exports);
        parcelHelpers.export(exports, "clsx", () => clsx);
        function r(e) {
          var t,
            f,
            n = "";
          if ("string" == typeof e || "number" == typeof e) n += e;
          else if ("object" == typeof e) {
            if (Array.isArray(e)) {
              var o = e.length;
              for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), (n += f));
            } else for (f in e) e[f] && (n && (n += " "), (n += f));
          }
          return n;
        }
        function clsx() {
          for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++)
            (e = arguments[f]) && (t = r(e)) && (n && (n += " "), (n += t));
          return n;
        }
        exports.default = clsx;
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "jnFvT" },
    ],
    "212U3": [
      function (require, module, exports, __globalThis) {
        module.exports =
          '*, :before, :after, ::backdrop {\n  --tw-border-spacing-x: 0;\n  --tw-border-spacing-y: 0;\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x: ;\n  --tw-pan-y: ;\n  --tw-pinch-zoom: ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-gradient-from-position: ;\n  --tw-gradient-via-position: ;\n  --tw-gradient-to-position: ;\n  --tw-ordinal: ;\n  --tw-slashed-zero: ;\n  --tw-numeric-figure: ;\n  --tw-numeric-spacing: ;\n  --tw-numeric-fraction: ;\n  --tw-ring-inset: ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: #3b82f680;\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur: ;\n  --tw-brightness: ;\n  --tw-contrast: ;\n  --tw-grayscale: ;\n  --tw-hue-rotate: ;\n  --tw-invert: ;\n  --tw-saturate: ;\n  --tw-sepia: ;\n  --tw-drop-shadow: ;\n  --tw-backdrop-blur: ;\n  --tw-backdrop-brightness: ;\n  --tw-backdrop-contrast: ;\n  --tw-backdrop-grayscale: ;\n  --tw-backdrop-hue-rotate: ;\n  --tw-backdrop-invert: ;\n  --tw-backdrop-opacity: ;\n  --tw-backdrop-saturate: ;\n  --tw-backdrop-sepia: ;\n  --tw-contain-size: ;\n  --tw-contain-layout: ;\n  --tw-contain-paint: ;\n  --tw-contain-style: ;\n}\n\n*, :before, :after {\n  box-sizing: border-box;\n  border: 0 solid #e5e7eb;\n}\n\n:before, :after {\n  --tw-content: "";\n}\n\nhtml, :host {\n  -webkit-text-size-adjust: 100%;\n  tab-size: 4;\n  font-feature-settings: normal;\n  font-variation-settings: normal;\n  -webkit-tap-highlight-color: transparent;\n  font-family: ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;\n  line-height: 1.5;\n}\n\nbody {\n  line-height: inherit;\n  margin: 0;\n}\n\nhr {\n  height: 0;\n  color: inherit;\n  border-top-width: 1px;\n}\n\nabbr:where([title]) {\n  text-decoration: underline dotted;\n}\n\nh1, h2, h3, h4, h5, h6 {\n  font-size: inherit;\n  font-weight: inherit;\n}\n\na {\n  color: inherit;\n  text-decoration: inherit;\n}\n\nb, strong {\n  font-weight: bolder;\n}\n\ncode, kbd, samp, pre {\n  font-feature-settings: normal;\n  font-variation-settings: normal;\n  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;\n  font-size: 1em;\n}\n\nsmall {\n  font-size: 80%;\n}\n\nsub, sup {\n  vertical-align: baseline;\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n}\n\nsub {\n  bottom: -.25em;\n}\n\nsup {\n  top: -.5em;\n}\n\ntable {\n  text-indent: 0;\n  border-color: inherit;\n  border-collapse: collapse;\n}\n\nbutton, input, optgroup, select, textarea {\n  font-feature-settings: inherit;\n  font-variation-settings: inherit;\n  font-family: inherit;\n  font-size: 100%;\n  font-weight: inherit;\n  line-height: inherit;\n  letter-spacing: inherit;\n  color: inherit;\n  margin: 0;\n  padding: 0;\n}\n\nbutton, select {\n  text-transform: none;\n}\n\nbutton, input:where([type="button"]), input:where([type="reset"]), input:where([type="submit"]) {\n  -webkit-appearance: button;\n  background-color: #0000;\n  background-image: none;\n}\n\n:-moz-focusring {\n  outline: auto;\n}\n\n:-moz-ui-invalid {\n  box-shadow: none;\n}\n\nprogress {\n  vertical-align: baseline;\n}\n\n::-webkit-inner-spin-button {\n  height: auto;\n}\n\n::-webkit-outer-spin-button {\n  height: auto;\n}\n\n[type="search"] {\n  -webkit-appearance: textfield;\n  outline-offset: -2px;\n}\n\n::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n\n::-webkit-file-upload-button {\n  -webkit-appearance: button;\n  font: inherit;\n}\n\nsummary {\n  display: list-item;\n}\n\nblockquote, dl, dd, h1, h2, h3, h4, h5, h6, hr, figure, p, pre {\n  margin: 0;\n}\n\nfieldset {\n  margin: 0;\n  padding: 0;\n}\n\nlegend {\n  padding: 0;\n}\n\nol, ul, menu {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\ndialog {\n  padding: 0;\n}\n\ntextarea {\n  resize: vertical;\n}\n\ninput::placeholder, textarea::placeholder {\n  opacity: 1;\n  color: #9ca3af;\n}\n\nbutton, [role="button"] {\n  cursor: pointer;\n}\n\n:disabled {\n  cursor: default;\n}\n\nimg, svg, video, canvas, audio, iframe, embed, object {\n  vertical-align: middle;\n  display: block;\n}\n\nimg, video {\n  max-width: 100%;\n  height: auto;\n}\n\n[hidden]:where(:not([hidden="until-found"])) {\n  display: none;\n}\n\n.static {\n  position: static;\n}\n\n.relative {\n  position: relative;\n}\n\n.block {\n  display: block;\n}\n\n.resize {\n  resize: both;\n}\n\n.rounded {\n  border-radius: .25rem;\n}\n\n.border {\n  border-width: 1px;\n}\n\n.shadow {\n  --tw-shadow: 0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a;\n  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.shadow-2xl {\n  --tw-shadow: 0 25px 50px -12px #00000040;\n  --tw-shadow-colored: 0 25px 50px -12px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.shadow-lg {\n  --tw-shadow: 0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a;\n  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.shadow-md {\n  --tw-shadow: 0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a;\n  --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.shadow-sm {\n  --tw-shadow: 0 1px 2px 0 #0000000d;\n  --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.shadow-xl {\n  --tw-shadow: 0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a;\n  --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.transition {\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;\n  transition-duration: .15s;\n  transition-timing-function: cubic-bezier(.4, 0, .2, 1);\n}\n\n.widget {\n  text-transform: uppercase;\n  justify-content: center;\n  align-items: center;\n  padding-top: .5rem;\n  padding-bottom: .5rem;\n  display: flex;\n}\n\n.font-family {\n  font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Liberation Sans, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;\n}\n';
      },
      {},
    ],
    "4LQ2d": [
      function (require, module, exports, __globalThis) {
        var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
        parcelHelpers.defineInteropFlag(exports);
        function contrastColor(inputColor) {
          // --- Helpers --------------------------------------------------------------
          // Clamp number into [min, max]
          const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
          // Convert sRGB channel [0..255] to linear light
          const srgbToLinear = (c255) => {
            const c = c255 / 255;
            return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
          };
          // Relative luminance per WCAG (0..1)
          const relativeLuminance = (r, g, b) => {
            const R = srgbToLinear(r);
            const G = srgbToLinear(g);
            const B = srgbToLinear(b);
            return 0.2126 * R + 0.7152 * G + 0.0722 * B;
          };
          // Contrast ratio between two luminances (L1 lighter, L2 darker)
          const contrastRatio = (L1, L2) => (L1 + 0.05) / (L2 + 0.05);
          // Parse #RGB, #RGBA, #RRGGBB, #RRGGBBAA
          const parseHex = (hexInput) => {
            const hex = hexInput.slice(1).trim();
            const len = hex.length;
            if (len !== 3 && len !== 4 && len !== 6 && len !== 8)
              throw new Error("Invalid HEX length. Use #RGB, #RGBA, #RRGGBB, or #RRGGBBAA.");
            const toByte = (h) => parseInt(h, 16);
            let r, g, b;
            if (len === 3 || len === 4) {
              // Expand short form (#abc[#d] -> #aabbcc[dd])
              r = toByte(hex[0] + hex[0]);
              g = toByte(hex[1] + hex[1]);
              b = toByte(hex[2] + hex[2]);
              // alpha (hex[3]) is ignored for contrast background
            } else {
              r = toByte(hex.slice(0, 2));
              g = toByte(hex.slice(2, 4));
              b = toByte(hex.slice(4, 6));
              // alpha (hex[6..8]) is ignored
            }
            if ([r, g, b].some((v) => Number.isNaN(v))) throw new Error("Invalid HEX digits.");
            return {
              r,
              g,
              b,
            };
          };
          // Parse rgb()/rgba(); supports integers 0..255 or percentages 0%..100%
          const parseRgbFunc = (rgbInput) => {
            // Normalize and extract content inside parentheses
            const open = rgbInput.indexOf("(");
            const close = rgbInput.lastIndexOf(")");
            if (open === -1 || close === -1 || close <= open)
              throw new Error("Malformed rgb()/rgba() string.");
            const inner = rgbInput.slice(open + 1, close).trim();
            // Split by commas, tolerate extra spaces
            const parts = inner.split(/\s*,\s*/);
            if (parts.length < 3) throw new Error("rgb()/rgba() must have at least 3 components.");
            const parseChannel = (s) => {
              // Percentage form e.g., "80%"
              const percentMatch = s.match(/^(-?\d+(?:\.\d+)?)%$/);
              if (percentMatch) {
                const p = parseFloat(percentMatch[1]);
                return clamp(Math.round((p / 100) * 255), 0, 255);
              }
              // Integer 0..255 (also accepts floats and rounds)
              const n = Number(s);
              if (Number.isNaN(n)) throw new Error("Invalid RGB channel value.");
              return clamp(Math.round(n), 0, 255);
            };
            const r = parseChannel(parts[0]);
            const g = parseChannel(parts[1]);
            const b = parseChannel(parts[2]);
            // Alpha (parts[3]) is intentionally ignored for background color
            return {
              r,
              g,
              b,
            };
          };
          // --- Main -----------------------------------------------------------------
          let r, g, b;
          const color = inputColor.trim();
          if (color.startsWith("#")) ({ r, g, b } = parseHex(color));
          else if (color.toLowerCase().startsWith("rgb"))
            ({ r, g, b } = parseRgbFunc(color)); // Keep API behavior: only HEX or rgb()/rgba() are accepted
          else
            throw new Error(
              "Color format not recognized. Use HEX (#RRGGBB, #RGB, with optional alpha) or rgb()/rgba()."
            );
          // Compute relative luminance
          const Lbg = relativeLuminance(r, g, b);
          // Compare contrast vs black (#000) and white (#fff); pick better
          const Lwhite = 1.0; // luminance of #fff
          const Lblack = 0.0; // luminance of #000
          const contrastWithWhite = contrastRatio(Math.max(Lwhite, Lbg), Math.min(Lwhite, Lbg));
          const contrastWithBlack = contrastRatio(Math.max(Lbg, Lblack), Math.min(Lbg, Lblack));
          // Return "black" or "white" to keep original API
          return contrastWithBlack >= contrastWithWhite ? "black" : "white";
        }
        exports.default = contrastColor;
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "jnFvT" },
    ],
    bVzki: [
      function (require, module, exports, __globalThis) {
        // darkenColor.ts
        var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
        parcelHelpers.defineInteropFlag(exports);
        function darkenColor(color, percent) {
          // --- Helpers --------------------------------------------------------------
          const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
          const toByte = (n) => clamp(Math.floor(n), 0, 255); // <= floor for stable expectations
          // Clamp percent to [-1, 1]; negative => darken, positive => lighten
          const p = Math.max(-1, Math.min(1, percent));
          // Parse #RGB/#RGBA/#RRGGBB/#RRGGBBAA
          const parseHex = (hexInput) => {
            const hex = hexInput.slice(1).trim();
            const len = hex.length;
            if (![3, 4, 6, 8].includes(len))
              throw new Error("Invalid HEX length. Use #RGB, #RGBA, #RRGGBB, or #RRGGBBAA.");
            const expand = (c) => c + c;
            let r,
              g,
              b,
              a = null;
            if (len === 3 || len === 4) {
              r = parseInt(expand(hex[0]), 16);
              g = parseInt(expand(hex[1]), 16);
              b = parseInt(expand(hex[2]), 16);
              if (len === 4) a = parseInt(expand(hex[3]), 16) / 255;
            } else {
              r = parseInt(hex.slice(0, 2), 16);
              g = parseInt(hex.slice(2, 4), 16);
              b = parseInt(hex.slice(4, 6), 16);
              if (len === 8) a = parseInt(hex.slice(6, 8), 16) / 255;
            }
            if ([r, g, b].some(Number.isNaN)) throw new Error("Invalid HEX digits.");
            return {
              r,
              g,
              b,
              a,
            };
          };
          // Parse rgb()/rgba(); supports integers and percentages
          const parseRgb = (rgbInput) => {
            const open = rgbInput.indexOf("(");
            const close = rgbInput.lastIndexOf(")");
            if (open === -1 || close === -1 || close <= open)
              throw new Error("Malformed rgb()/rgba().");
            const inner = rgbInput.slice(open + 1, close).trim();
            const parts = inner.split(/\s*,\s*/);
            if (parts.length < 3) throw new Error("rgb()/rgba() must have at least 3 components.");
            const parseChan = (s) => {
              const m = s.match(/^(-?\d+(?:\.\d+)?)%$/);
              if (m) return toByte((parseFloat(m[1]) / 100) * 255);
              const n = Number(s);
              if (Number.isNaN(n)) throw new Error("Invalid RGB channel value.");
              return toByte(n);
            };
            const r = parseChan(parts[0]);
            const g = parseChan(parts[1]);
            const b = parseChan(parts[2]);
            let a = null;
            if (parts[3] !== undefined) {
              const an = Number(parts[3]);
              if (Number.isNaN(an)) throw new Error("Invalid alpha channel.");
              a = clamp(an, 0, 1);
            }
            return {
              r,
              g,
              b,
              a,
            };
          };
          // --- Parse input ----------------------------------------------------------
          const src = color.trim();
          const hasHex = src.startsWith("#");
          const isRGBA = src.toLowerCase().startsWith("rgba");
          const isRGB = src.toLowerCase().startsWith("rgb");
          let r, g, b, a;
          if (hasHex) ({ r, g, b, a } = parseHex(src));
          else if (isRGB) {
            ({ r, g, b, a } = parseRgb(src));
            if (a === null) a = isRGBA ? 1 : null; // keep family: rgba stays rgba, rgb stays rgb
          } else throw new Error("Invalid color format. Use HEX (#...[,AA]) or rgb()/rgba().");
          // --- Apply lighten/darken -------------------------------------------------
          const target = p < 0 ? 0 : 255;
          const pp = Math.abs(p);
          r = toByte(r + (target - r) * pp);
          g = toByte(g + (target - g) * pp);
          b = toByte(b + (target - b) * pp);
          // --- Serialize back in the original family --------------------------------
          if (hasHex) {
            const hex = (v) => v.toString(16).padStart(2, "0");
            const base = `#${hex(r)}${hex(g)}${hex(b)}`;
            return a !== null ? `${base}${hex(Math.floor((a ?? 1) * 255))}` : base; // keep alpha byte; floor for stability
          }
          if (isRGBA) {
            const outA = a ?? 1;
            return `rgba(${r}, ${g}, ${b}, ${outA})`;
          }
          return `rgb(${r}, ${g}, ${b})`;
        }
        exports.default = darkenColor;
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "jnFvT" },
    ],
    gVCft: [
      function (require, module, exports, __globalThis) {
        module.exports = {
          allowFonts: [
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
            "Spline Sans Mono",
          ],
        };
      },
      {},
    ],
    fhVkf: [
      function (require, module, exports, __globalThis) {
        // isDark.ts
        /**
         * Detect if user prefers dark color scheme.
         * Returns `false` if matchMedia is not available (e.g. server-side).
         */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
        parcelHelpers.defineInteropFlag(exports);
        function isDark() {
          if (typeof window === "undefined" || typeof window.matchMedia !== "function")
            return false;
          return window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
        exports.default = isDark;
      },
      { "@parcel/transformer-js/src/esmodule-helpers.js": "jnFvT" },
    ],
  },
  ["bjVXy", "6Jsm5"],
  "6Jsm5",
  "parcelRequired811",
  {}
);

//# sourceMappingURL=Simple-Digital-Clock-Widget.20947fa2.js.map
