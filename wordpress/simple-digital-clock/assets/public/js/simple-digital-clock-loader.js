(function () {
    'use strict';

    var tagName = 'timenow-zone-sdcw';
    var config = document.getElementById('simple-digital-clock-runtime');
    if (!config || config.localName !== 'script' || config.type !== 'application/json' || config.dataset.sdcwLoader) {
        return;
    }

    var observer;
    var timeout;
    var cleanups = [];
    config.dataset.sdcwLoader = 'waiting';

    function finish(error) {
        if (config.dataset.sdcwLoader === 'ready' || config.dataset.sdcwLoader === 'error') {
            return;
        }
        config.dataset.sdcwLoader = error ? 'error' : 'ready';
        if (observer) {
            observer.disconnect();
        }
        clearTimeout(timeout);
        document.removeEventListener('DOMContentLoaded', inspectDocument);
        cleanups.forEach(function (cleanup) { cleanup(); });
        cleanups = [];
        if (error) {
            console.error('Simple Digital Clock: ' + error.message);
            document.dispatchEvent(new CustomEvent('sdcw:load-error', {
                detail: { message: error.message }
            }));
        }
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
        // Parse only after a real clock exists, outside the document's preload parser.
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

    async function activate(scripts) {
        var external = scripts.filter(function (script) { return script.hasAttribute('src'); });
        var runtime = external.find(function (script) { return script.id === 'simple-digital-clock-js'; }) || external[external.length - 1];
        var runtimeSource = normalizedSource(runtime);
        var existing = Array.from(document.scripts).find(function (script) {
            return script.id === 'simple-digital-clock-js' || normalizedSource(script) === runtimeSource;
        });
        if (existing) {
            // The existing owner retains its own before/after data and load policy.
            await Promise.race([
                watchScript(existing),
                customElements.whenDefined(tagName)
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
            if (!customElements.get(tagName)) {
                throw new Error('The loaded runtime did not register the clock element.');
            }
            finish();
        }
    }

    function start() {
        if (config.dataset.sdcwLoader !== 'waiting') {
            return;
        }
        if (customElements.get(tagName)) {
            finish();
            return;
        }
        config.dataset.sdcwLoader = 'loading';
        if (observer) {
            observer.disconnect();
        }
        document.removeEventListener('DOMContentLoaded', inspectDocument);
        timeout = setTimeout(function () {
            finish(new Error('Timed out while loading the clock runtime.'));
        }, 15000);
        try {
            activate(capturedScripts()).catch(finish);
        } catch (error) {
            finish(error);
        }
    }

    function containsClock(node) {
        if (!(node instanceof Element) || !node.isConnected) {
            return false;
        }
        if (node instanceof HTMLElement && node.localName === tagName) {
            return true;
        }
        return Array.from(node.querySelectorAll(tagName)).some(function (clock) {
            return clock instanceof HTMLElement && clock.isConnected;
        });
    }

    function inspectDocument() {
        if (containsClock(document.documentElement)) {
            start();
        }
    }

    if (!window.customElements || !window.MutationObserver) {
        finish(new Error('This browser does not support custom elements and DOM observation.'));
        return;
    }
    if (customElements.get(tagName)) {
        finish();
        return;
    }
    observer = new MutationObserver(function (records) {
        for (var record of records) {
            for (var node of record.addedNodes) {
                if (containsClock(node)) {
                    start();
                    return;
                }
            }
        }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    inspectDocument();
    if (config.dataset.sdcwLoader === 'waiting' && document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inspectDocument, { once: true });
    }
}());
