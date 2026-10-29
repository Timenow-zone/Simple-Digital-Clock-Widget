# Native HTTPS — Simple Digital Clock 1.1.2

> Historical report for a previous artifact. Current candidate and results: [README](README.md), [KSES72 acceptance](KSES72-VERIFICATION.md). The shared ZIP/diff paths below may have been updated after this run; the original SHA values and results are retained as history.

28 October 2026. **Native HTTPS verified: 28/28 server checks and 271/271 browser checks. The gap is closed for the specified configuration. No new regressions found. Nothing published.**

The previous exact ZIP `1e5d3f0d5f7189f0fa6dca4539bf83860fbc46a7a7513f8c2c2b004f722038a3` was checked. Product source and the archive were unchanged.

## Environment and TLS

- Real Local 10.2.0, site `SDCW-112-Isolated-20261028`, ID `ujo3kaSGV`.
- WordPress 7.1.3, PHP 8.2.29, nginx 1.26.1, MySQL 8.4.0, Twenty Twenty-Five.
- Native Local router in Site Domains mode: `https://sdcw-112-isolated-20261028.local`, standard port 443. This is neither Docker nor a separate TLS simulation.
- Only this test site is registered in Local. Before changing mode, ports 80/443 were checked as available, and configurations, full SQL, and a snapshot of 1598 original posts rows with settings were saved.
- Only this test site's `home`/`siteurl` were changed to HTTPS. No bulk content replacement was performed.
- TLS checks validated the chain and hostname against an explicitly specified file containing the site's own certificate, without `-k`, `verify=false`, or `ignoreHTTPSErrors=true`. Clients disallow environment proxies and redirects to other origins.

Local's self-signed certificate has the required domain and its wildcard in the SAN. SHA-256 fingerprint:

```text
CF:3E:5A:39:69:FE:5E:4A:49:05:04:81:38:F5:8D:57:C2:A2:4D:F7:6C:34:14:AB:1B:D4:2D:1F:21:62:8E:65
```

TLS 1.3 was confirmed. Before trust was configured, headless Chromium with `ignoreHTTPSErrors:false` correctly rejected the certificate: `ERR_CERT_AUTHORITY_INVALID`. After separate user authorization, trust was configured for this certificate using only the SSL policy in the user's login keychain, without `-d`/admin/System store. `security verify-cert` confirmed trust; Chromium/WebKit and regular Safari subsequently opened the site without bypassing certificate validation. The authorized user-level SSL trust was retained after testing.

## Isolation

The standard Local router listens on wildcard interfaces. An attempt to check a new nginx loopback binding through the CLI received a system `Permission denied` when binding a privileged port; no separate server was started. A safe alternative was applied to the existing Native router: HTTP ACL `allow 127.0.0.1; allow ::1; deny all;`. Its standard listeners and TLS/proxy settings were not replaced.

Two requests to socket `127.0.0.1:443` were checked: a request from a loopback source succeeds; a request from another local address belonging to the same machine returns **403**. The probe packets do not go to an external server. Originals of three configuration files were saved. This restricts HTTP access; it does not claim that the TCP listener is bound to loopback.

## Passed checks

| Check | Result |
| --- | --- |
| Certificate/hostname validation and TLS handshake | PASS, TLS 1.3 |
| HTTPS login and both cookie types | PASS, Secure + HttpOnly |
| Authenticated REST with session nonce | PASS |
| Real HTTP POST `admin-ajax.php`, `action=update-plugin`, Core updates nonce | PASS, 1.1.1 → exact 1.1.2 |
| All 15 installed files after HTTP update match the accepted ZIP | PASS |
| Title-only, full, and repeated REST saves as Administrator/Editor/Author | PASS, seven clock configurations in each post |
| REST saving of a block widget and its sidebar | PASS |
| Server HTML for three pages: 7 clocks in each post and 7 in the sidebar | PASS, 14 tags; active resources contain no HTTP URLs |
| Physical rollback to official 1.1.1 and reading saved content over HTTPS | PASS |
| Reupgrade and HTTPS REST-read | PASS |
| Original 1598 complete posts rows after the entire cycle | Preserved byte-for-byte; 6 test rows added; SQL was not restored |

The server scenario contains **28 checks**; additional TLS/auth and access probes are retained separately. The update offer supplied a temporary copy of the exact local ZIP; public WordPress.org delivery was not tested. The update transient was restored after the request. Snapshots of all posts and `widget_*`, `sidebars_widgets`, `theme_mods_*`, `home`, `siteurl`, and `active_plugins` matched before/after every file replacement.

The cookie check initially expected exactly two instances. WordPress sets the secure-auth cookie on two paths and the logged-in cookie at the root: there are actually three instances. The criterion was corrected to require both types and Secure/HttpOnly on each. Path metadata was retained without cookie values.

## Browser acceptance — complete

`native-https/browser-tests.mjs` ran with normal TLS validation (`ignoreHTTPSErrors:false`). It checked Administrator, Editor, and Author; seven clocks in a post and seven in a separate Core sidebar; 1440/390 px. Editors after upgrade and rollback opened in America/New_York; the original reference used UTC.

| Stage | Chromium | WebKit |
| --- | --- | --- |
| Official 1.1.1 HTTPS reference | 31/31 | 31/31 |
| 1.1.2: real Save button, title-only, full Gutenberg serialization, and repeated saving | 49/49 | 49/49 |
| Reading after physical rollback to 1.1.1 | 37/37 | 37/37 |
| Reading after another standard upgrade to the exact ZIP | 37/37 | — |

Total: **271/271**. Settings, caption DOM, neighboring content, and sidebar were preserved. Blocks are valid, and reading does not create a dirty state. Live shadow DOM, text at a fixed time, geometry, and styles matched 1.1.1; geometry tolerance is 0.001 CSS px. Accepted runs had no mixed content or uncaught runtime errors; local asset/REST requests stayed on HTTPS. Secure/HttpOnly was checked across all cookie paths.

Regular Safari separately opened Native HTTPS on 1.1.1 and after upgrade to 1.1.2: the window reported `IsSecure=true`, displaying 14 working clocks, viewer-local time, and Unicode captions. No certificate exception was added. Only the newly created control tab was closed. Manual editing in regular Safari is not claimed: real Save buttons were tested through Chromium/WebKit automation.

After the complete cycle, all **1598 original posts rows were preserved byte-for-byte**; 23 test rows, including revisions, were added. The database was not restored. Original `home`/`siteurl` (`http://localhost:10003`), Router Mode `localhost`, and the three Native router configuration files were restored. Ports 80/443 were confirmed closed and site `ujo3kaSGV` was stopped; data, SQL, and evidence were retained.

## Setup and retained failed attempts

- Local's Trust button returned an error; the Keychain Access UI timed out. After user authorization, the standard macOS `security add-trusted-cert` command was used with only the SSL policy and user keychain. The agent neither requested nor entered the user's password.
- User SSL trust with an additional hostname policy-string passed in macOS/WebKit, but Chromium still rejected the certificate. Standard SSL trust for the same certificate, with hostname validation against its SAN, passed in both engines. The product was unchanged; the initial rejection is retained.
- In the first browser cookie check, URL `/` excluded secure-auth cookies on `/wp-admin` and `/wp-content/plugins`. Reading was corrected to include all context cookies; every instance was checked for Secure/HttpOnly.
- The first Save run stopped at Editor because Gutenberg's welcome guide hid the button from the accessibility locator. The control saved the button list and published status; the test closes the standard guide, then the retry passed. The original JSON was not overwritten.

## Scope and limitations

Single-site Native Local HTTPS on this Mac is confirmed for Chromium, WebKit, and regular Safari frontend. Firefox HTTPS, Windows/iOS, subdomain multisite, public WordPress.org delivery, and the reviewer's site were not tested. External Google Fonts delivery was blocked; their URLs were checked for HTTPS. No new millions of PHP/entities tests are claimed: this run supplements previous acceptance of **the same unchanged ZIP**.

The previous Native HTTPS limitation in [GAP-CLOSURE.md](GAP-CLOSURE.md) applies to the stage before this check. The [new evidence manifest](native-https-evidence.json) records this additional stage separately.

Evidence and scripts: `.local/wordpress-lab/native-https/`. SQL, credentials, keys, and environment are not intended for publication. The plugin, SVN, GitHub, forum, and real sites were neither published to nor changed.
