(function ($) {
    'use strict';

    // Core's autosave allowlist does not include arbitrary hidden form fields.
    $(document).on('before-autosave.sdcwClock', function (event, data) {
        var marker = document.getElementById('sdcw-classic-editor');
        if (marker && data && typeof data === 'object') {
            data.sdcw_classic_editor = marker.value;
        }
    });
})(jQuery);
