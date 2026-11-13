/* global tinymce */
(function () {
    // TinyMCE 4 calls hasOwnProperty on its maps; retain Object.prototype.
    function copyMap(source) {
        var copy = {};
        Object.keys(source).forEach(function (name) {
            Object.defineProperty(copy, name, {
                value: source[name], enumerable: true, configurable: true, writable: true
            });
        });
        return copy;
    }

    tinymce.PluginManager.add('simple_digital_clock', function (editor) {
        editor.on('PreInit', function () {
            var rule = editor.schema.getElementRule('timenow-zone-sdcw');
            // Respect an explicit invalid_elements policy instead of recreating the tag.
            if (!rule) {
                return;
            }
            // Custom elements inherit span's attribute objects. Detach before extending
            // so native globals and their constraints survive without changing span.
            var attributes = copyMap(rule.attributes);
            rule.attributes = attributes;
            rule.attributesOrder = rule.attributesOrder.slice();
            editor.getParam('sdcw_clock_attributes', '').split('|').forEach(function (name) {
                if (name && !Object.prototype.hasOwnProperty.call(attributes, name)) {
                    attributes[name] = {};
                    rule.attributesOrder.push(name);
                }
            });
            // An empty clock renders in its shadow root, so its parent is not empty.
            // Extend the live schema without replacing TinyMCE or other plugins' rules.
            var nonEmpty = editor.schema.getNonEmptyElements();
            nonEmpty['timenow-zone-sdcw'] = {};
            nonEmpty['TIMENOW-ZONE-SDCW'] = {};
        });
    });

    // Core's dynamic Text widget editor exposes this event instead of PHP filters.
    var configuration = window.SDCWClassicEditorSettings;
    if (configuration && window.jQuery) {
        window.jQuery(document).on('wp-before-tinymce-init.sdcwClock', function (event, settings) {
            var plugins = typeof settings.external_plugins === 'undefined' ? {} : settings.external_plugins;
            if (typeof plugins === 'string') {
                try {
                    plugins = JSON.parse(plugins);
                } catch (error) {
                    window.jQuery(document).trigger('sdcw-editor-diagnostic', ['invalid_external_plugins']);
                    return;
                }
            }
            if (!plugins || typeof plugins !== 'object' || Array.isArray(plugins)) {
                window.jQuery(document).trigger('sdcw-editor-diagnostic', ['invalid_external_plugins']);
                return;
            }
            var existing = typeof settings.custom_elements === 'undefined' ? '' : settings.custom_elements;
            if (typeof existing !== 'string') {
                window.jQuery(document).trigger('sdcw-editor-diagnostic', ['invalid_element_rules']);
                return;
            }
            var combined = copyMap(plugins);
            combined.simple_digital_clock = configuration.plugin_url;
            if (existing.split(',').map(function (name) { return name.trim(); }).indexOf(configuration.custom_elements) === -1) {
                existing = existing.replace(/[,\s]+$/, '');
                existing = existing ? existing + ',' + configuration.custom_elements : configuration.custom_elements;
            }
            settings.custom_elements = existing;
            settings.sdcw_clock_attributes = configuration.sdcw_clock_attributes;
            settings.external_plugins = combined;
        });
    }
}());
