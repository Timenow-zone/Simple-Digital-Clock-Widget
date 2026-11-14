import { registerClockElement } from "./clock-element";

(function () {
    'use strict';

    var tagName = 'timenow-zone-sdcw';
    var config = document.getElementById('simple-digital-clock-runtime');
    if (!config || config.localName !== 'script' || config.type !== 'application/json' || config.dataset.sdcwLoader) {
        return;
    }

    var timeout;
    var cleanups = [];
    var preparedScripts;
    var configurationError;
    var lazy = true;
    config.dataset.sdcwLoader = 'waiting';

    function finish(error) {
        if (config.dataset.sdcwLoader === 'ready' || config.dataset.sdcwLoader === 'error') {
            return;
        }
        config.dataset.sdcwLoader = error ? 'error' : 'ready';
        clearTimeout(timeout);
        document.removeEventListener('DOMContentLoaded', initialize);
        cleanups.forEach(function (cleanup) { cleanup(); });
        cleanups = [];
        if (error) {
            console.error('Simple Digital Clock: ' + error.message);
            document.dispatchEvent(new CustomEvent('sdcw:load-error', {
                detail: { message: error.message }
            }));
        }
    }

    function runtimeIsReady() {
        var element = customElements.get(tagName);
        return element && (element.sdcwBridgeVersion !== 1 || element.runtimeReady);
    }

    function runtimeReady() {
        var element = customElements.get(tagName);
        return element && element.sdcwBridgeVersion === 1 ? element.whenRuntimeReady : customElements.whenDefined(tagName);
    }

    function normalizedSource(script) {
        if (!script.hasAttribute('src')) {
            return null;
        }
        try {
            var url = new URL(script.getAttribute('src'), document.baseURI);
            url.hash = '';
            return url.href;
        } catch (error) {
            return null;
        }
    }

    function capturedScripts() {
        var payload;
        try {
            payload = JSON.parse(config.textContent);
        } catch (error) {
            throw new Error('The runtime configuration is not valid JSON.');
        }
        if (!payload || typeof payload.markup !== 'string') {
            throw new Error('The runtime configuration has no script markup.');
        }
        if (payload.lazy !== undefined && typeof payload.lazy !== 'boolean') {
            throw new Error('The runtime loading policy must be a boolean.');
        }
        lazy = payload.lazy !== false;
        // A detached template never exposes captured sources to preload scanners.
        var template = document.createElement('template');
        template.innerHTML = payload.markup;
        var scripts = [];
        Array.from(template.content.childNodes).forEach(function (node) {
            if (node.nodeType === Node.COMMENT_NODE ||
                (node.nodeType === Node.TEXT_NODE && !node.textContent.trim())) {
                return;
            }
            if (!(node instanceof HTMLScriptElement)) {
                throw new Error('The runtime template contains unsupported markup.');
            }
            var type = (node.getAttribute('type') || '').trim().toLowerCase();
            if (!['', 'text/javascript', 'application/javascript', 'text/ecmascript', 'application/ecmascript', 'module'].includes(type) ||
                node.hasAttribute('data-src') || node.noModule ||
                (node.hasAttribute('src') && !node.getAttribute('src').trim())) {
                throw new Error('The runtime script was transformed into an unsupported loading format.');
            }
            if (node.hasAttribute('src') && normalizedSource(node) === null) {
                throw new Error('The runtime configuration contains an invalid script URL.');
            }
            scripts.push(node);
        });
        if (!scripts.some(function (script) { return script.hasAttribute('src'); })) {
            throw new Error('The runtime template has no external script.');
        }
        return scripts;
    }

    function watchScript(script) {
        return new Promise(function (resolve, reject) {
            function cleanup() {
                script.removeEventListener('load', loaded);
                script.removeEventListener('error', failed);
            }
            function loaded() { cleanup(); resolve(); }
            function failed() { cleanup(); reject(new Error('Unable to load the clock runtime script.')); }
            script.addEventListener('load', loaded);
            script.addEventListener('error', failed);
            cleanups.push(cleanup);
        });
    }

    function existingRuntime(scripts) {
        var external = scripts.filter(function (script) { return script.hasAttribute('src'); });
        var runtime = external.find(function (script) { return script.id === 'simple-digital-clock-js'; }) || external[external.length - 1];
        var runtimeSource = runtime ? normalizedSource(runtime) : null;
        return Array.from(document.scripts).find(function (script) {
            return script.id === 'simple-digital-clock-js' || (runtimeSource && normalizedSource(script) === runtimeSource);
        });
    }

    async function activate(scripts) {
        var existing = existingRuntime(scripts);
        if (existing) {
            // The existing owner retains its own before/after data and load policy.
            await Promise.race([
                watchScript(existing),
                runtimeReady()
            ]);
        } else {
            for (var source of scripts) {
                if (config.dataset.sdcwLoader !== 'loading') {
                    return;
                }
                var script = document.createElement('script');
                Array.from(source.attributes).forEach(function (attribute) {
                    script.setAttribute(attribute.name, attribute.value);
                });
                // Browsers hide nonce attribute values on connected script elements.
                if (source.nonce) {
                    script.nonce = source.nonce;
                }
                script.textContent = source.textContent;
                var pending = script.hasAttribute('src') || script.type === 'module' ? watchScript(script) : null;
                config.before(script);
                if (pending) {
                    await pending;
                }
            }
        }
        if (config.dataset.sdcwLoader === 'loading') {
            if (!runtimeIsReady()) {
                throw new Error('The loaded runtime did not initialize the clock element.');
            }
            finish();
        }
    }

    function start() {
        if (config.dataset.sdcwLoader !== 'waiting') {
            return;
        }
        if (runtimeIsReady()) {
            finish();
            return;
        }
        config.dataset.sdcwLoader = 'loading';
        timeout = setTimeout(function () {
            finish(new Error('Timed out while loading the clock runtime.'));
        }, 15000);
        try {
            if (configurationError && !existingRuntime([])) {
                throw configurationError;
            }
            activate(preparedScripts || []).catch(finish);
        } catch (error) {
            finish(error);
        }
    }

    function initialize() {
        if (!window.customElements) {
            finish(new Error('This browser does not support custom elements.'));
            return;
        }
        if (runtimeIsReady()) {
            finish();
            return;
        }
        try {
            preparedScripts = capturedScripts();
        } catch (error) {
            // Invalid configuration stays inert until a clock actually requests it.
            configurationError = error;
        }
        // Preserve a pending legacy owner before reserving its custom-element name.
        if (existingRuntime(preparedScripts || [])) {
            start();
            return;
        }
        // An opaque Core override may be an immutable pre-bridge runtime.
        if (!lazy && !configurationError) {
            start();
            return;
        }
        try {
            registerClockElement(start);
        } catch (error) {
            finish(error);
        }
    }

    // Inspect all parser-emitted owners, including late footer scripts, first.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize, { once: true });
    } else {
        initialize();
    }
}());
