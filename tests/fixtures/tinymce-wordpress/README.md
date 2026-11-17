# WordPress TinyMCE test fixture

`tinymce.min.js` and `LICENSE.txt` are unchanged files from the official
[WordPress 6.3.14 archive](https://wordpress.org/wordpress-6.3.14.zip).
Their bytes were independently compared with the corresponding files in the
[WordPress 7.1.4 archive](https://wordpress.org/wordpress-7.1.4.zip); both contain
the same WordPress-bundled TinyMCE 4.9.11. `provenance.json` records archive hashes,
original paths, file sizes and file hashes. TinyMCE's LGPL 2.1 license is retained.

The fixture exercises the actual editor parser, live schema and serializer that
previously removed empty clock elements and their ancestors. Tests use the
plugin's real PHP-generated settings and real external TinyMCE plugin. Default
settings and settings without that external plugin are explicit negative
controls. Browser tests do not substitute a mock parser or global schema.

The current contract adds supported clock attributes to the inherited native
schema. It retains native IDs, global attributes and CSS filtering, does not leak
clock attributes into `span`, and respects explicit `invalid_elements` policies.
PHP settings and the dynamic Text widget event bridge both initialize the actual
TinyMCE editor. A small DOM-event adapter supplies only the `jQuery(...).on` and
`trigger` transport used by that bridge; jQuery internals are not substituted for
the parser or tested here. Invalid configuration, own-key map copying and foreign
plugin composition are separately checked. The real WordPress integration gate
uses Core's actual jQuery and widget/admin initialization.

These files are test-only; they are not bundled with the WordPress plugin or
widget runtime. Full WordPress role, KSES, persistence and Classic Editor UI
acceptance remain separate from this focused browser regression contract.
