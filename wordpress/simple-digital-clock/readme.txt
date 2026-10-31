=== Simple Digital Clock 🕒 ===
Contributors: falselight
Tags: clock, digital clock, local times, current time, world clock
Donate link: https://utctime.info/
Tested up to: 7.1
Requires at least: 6.3
Requires PHP: 7.0
Stable tag: 1.1.2
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Blocks: simple-digital-clock-block/widget-block

It is 🪄 a magical and easy-to-use digital clock with a beautiful UI, supporting multiple languages, locales, dates, captions, and time zones.

== 📌 Description ==
The Digital Clock Widget – the perfect addition to your website! This sleek and minimalist digital clock Gutenberg block (widget) offers a quick and easy way to display the current time on your site. With its clean design and unobtrusive style, it seamlessly blends into any webpage. Whether you're running a blog, an e-commerce store, or a personal website, our widget keeps your visitors informed with accurate, real-time information. Easy to install and highly customizable, it's the ideal choice for adding a touch of professionalism to your online presence. Upgrade your website today with the Simple Digital Clock Widget and keep your audience in sync with the times!

[Live demo](https://simple-digital-clock-widget.yuri.ws/)👀 | [CodePen playground](https://codepen.io/dejurin/pen/01a025ef-f466-7534-acd0-77bc3a368a47)👀

= ⭐️ FEATURES ⭐️ =
* 🚀 Lightweight (~11.2 KiB gzip)
* 🗣 Locale support (BCP-47, e.g., `en-US`, `uk`, `de-DE`)
* 🌐 IANA time zones (e.g., `Europe/Kyiv`, `UTC`)
* 📝 Custom caption
* 🎨 Styling: color/gradient, radius, shadows
* 🔢 24-hour or AM/PM, ⏱ seconds, ⏱️ optional hundredths of a second, 📅 date
* 🔒 SSL-friendly, 📱 responsive
* 💯 Free, no ads

= How it works =
1. Add the **Simple Digital Clock** block in the editor or as a widget.
2. Configure in the right sidebar:
   - **Locale** (e.g., `en-US`, `uk`, `fr-FR`)
   - **Time Zone** (IANA ID, e.g., `Europe/Kyiv`, `America/New_York`, `UTC`)
   - **Seconds**, **Hundredths**, **Date**, **24-Hour (AM/PM)**, **Caption**
   - Background/gradient, border radius, shadow, and font

**Hundredths** shows two fractional digits after the seconds for clocks that need finer visual precision. Hundredths automatically include seconds while enabled. Note: the browser may not render every 10 ms increment.

== 📌 Installation ==
= From your WordPress dashboard =
1. Go to **Plugins → Add New**
2. Search for **“Simple Digital Clock”**
3. Install & Activate
4. Insert the block in the editor or add it as a widget (**/wp-admin/widgets.php**)

= From WordPress.org =
1. Download **“Simple Digital Clock”**
2. Upload to **/wp-content/plugins/**
3. Activate
4. Insert the block / add the widget

== FAQ ==
= Can I set a custom locale (e.g., `uk` or `en-GB`)? =
Yes. Use the **Locale** field and enter any valid BCP-47 tag.

= Where does the clock get its time? =
The clock uses the date and time reported by the visitor's device and formats it for the selected time zone. It does not synchronize with a time server, so an incorrect device clock will affect the displayed time.

= How do I pick the time zone? =
Use the **Time Zone** field and select any valid IANA ID (e.g., `Europe/Kyiv`, `UTC`).

= Can I show hundredths of a second? =
Yes. Enable **“Hundredths of a second”** in the block settings. It shows two fractional digits and automatically includes seconds while enabled.

= Can I use my own fonts? =
You can choose from the available mono fonts (Google Fonts) or select **System** to use a local monospace font. Selecting a Google Font loads it from Google's servers.

= 24-hour format =
Yes. Enable **24-Hour** to force a 24-hour display. When disabled, the clock follows the selected locale. For AM/PM, choose a locale such as `en-US` and leave **24-Hour** disabled.

= Can I show different locales and time zones on the same page? =
Yes. Each block is independent—set its own locale and time zone.

= Is it fast? =
Yes. The bundled clock widget is about 11.2 KiB gzip and is served locally without a runtime JavaScript CDN dependency.

== Screenshots ==

1. screenshot-1.png – Front-end examples: multiple Simple Digital Clock blocks on one page, each with different locales, time zones, colors, and formats (AM/PM or 24-hour).
2. screenshot-2.png – Editor view: Gutenberg sidebar settings for the block (Container, Background Color, Options, Display, About, Advanced) to tweak size, radius, shadow, font, locale, time zone, seconds, date, etc.
3. screenshot-3.png – Block inserter: searching “Clock” and selecting the Simple Digital Clock block to add it to the page.
4. screenshot-4.png – Live preset gallery showing Local Time, London, New York, Tokyo, Kyiv, and the Hundredths preset.
5. screenshot-5.png – Live preview of a customized London clock with caption, seconds, date, color, radius, and shadow.

The plugin bundles its production JavaScript locally for performance. Human-readable source code and reproducible build instructions are available below.

== Source / Development ==

The production JavaScript bundled with this plugin is built from the public Simple Digital Clock Widget source.

* Source repository: https://github.com/Timenow-zone/Simple-Digital-Clock-Widget
* Bundled upstream version: 0.7.0
* Exact source for this bundled release: https://github.com/Timenow-zone/Simple-Digital-Clock-Widget/tree/v0.7.0

To reproduce the production bundle:

* `npm ci`
* `npm run build`

== Changelog ==

= 1.1.2 =
* Fixed caption preservation with the HTML API KSES sanitizer in WordPress 7.2 Beta 2.
* Fixed custom BCP-47 locale codes being discarded by the block editor.
* Fixed mouse activation of Auto language and Auto Timezone with open suggestions.
* Resetting Locale now restores the site language instead of an invalid empty locale.
* Resetting Time Zone preserves the string format supported by version 1.1.1.
* Fixed saved clock blocks becoming invalid when reopened in a different browser time zone, including in LocalWP.
* Fixed clock markup being removed when saved by users without unfiltered HTML permissions, including in LocalWP.

= 1.1.1 =
* Fixed the clock block layout so it stays correctly positioned within WordPress content containers and block themes.

= 1.1.0 =
* Added optional hundredths-of-a-second display.
* Updated bundled Simple Digital Clock Widget to 0.7.0.
* Updated live demo and source-code documentation.

= 1.0.5 =
* Migrated the clock block to Block API version 3 for compatibility with the iframe block editor: the clock preview now renders inside the WordPress 7.1 editor canvas.
* Verified compatibility with WordPress 7.1.

= 1.0.4 =
* Verified compatibility with WordPress 7.0.
* Added isolated upgrade-path testing from the public 1.0.3 release.
* Added WordPress 7 smoke coverage across PHP 8.2, 8.3, 8.4, and 8.5.

= 1.0.3 =
* Updated: POT file.

= 1.0.2 =
* Fix: Minor bugs fixed.

= 1.0.1 =
* Fix: JavaScript issue resolved.

= 1.0.0 =
* New: Stable release published.
* New: 24-hour time format option.

= 0.2.1 =
* Fix: Minor bugs fixed.

= 0.2.0 =
* Enhancement: Clock JavaScript updated.
* Fix: Minor bugs fixed.

= 0.1.1 =
* Fix: Minor bugs fixed.

= 0.1.0 =
* Initial release.


== 🍩 Donations ==
🕒 Sync Time: [UTC](https://utctime.info/)
🗓️ Today's Date: [TodaysDateNow](https://todaysdatenow.com/)
