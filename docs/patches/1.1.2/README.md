# Simple Digital Clock 1.1.2 — локальный кандидат

29 октября 2026. **P2 с новым KSES в WP 7.2 Beta 2 исправлен. Обновлённый ZIP прошёл регрессии, обратную совместимость, пересохранение, обновление и откат в локальной матрице. Публикаций нет.**

- [Исправление KSES, полный объём приёмки и ограничения](KSES72-VERIFICATION.md).
- [Машиночитаемые результаты и SHA-256 исходных доказательств](kses72-evidence.json).
- [Локальная подготовка Git/SVN и манифест релиза](../../releases/1.1.2/README.md).
- [Полный diff к официальной 1.1.1](simple-digital-clock-1.1.1-to-1.1.2.patch).
- ZIP: `.local/packages/simple-digital-clock-1.1.2-candidate.zip`.
- ZIP SHA-256: `6f896d42797e6d3a4727f8ece6d13bb8f4be2ed8e9425473ef02ea5e374d8720`.
- Diff SHA-256: `ae89ed02b7f2eebeaa7988a907b58dbdd0315a82c55f43c2013a3924407a4ee3`.

Относительно предыдущего подготовленного ZIP изменены только `includes/simple-digital-clock-kses.php` и changelog. Защита plain-text JSON-подписи действует до завершения нового KSES; настоящий HTML и остальные JSON-поля сохраняют текущую политику Core. `block.js`, схема, `save()`, CSS и runtime 0.7.0 не менялись. Миграций и нового формата хранения нет.

На окончательном ZIP прошли **18 336 PHP-проверок**, **1 309 248 DOM-сравнений entities**, проверки трёх браузерных движков, Locale/Reset, мобильного frontend, трёх тем с четырьмя режимами Autoptimize/WP Super Cache и Native HTTPS. Проверены 11 установок / 12 контекстов WP 6.3.2–7.2 Beta 2, PHP 7.0–8.5, LocalWP и multisite. Откат поверх пересохранённых данных и повторное обновление сохранили все 34 468 полных строк posts и настройки виджетов. БД не восстанавливалась.

Принят конкретный **7.2 Beta 2**, окончательная WP 7.2 ещё не проверена; `Tested up to: 7.1` сохранён. Новое HTTPS-тестирование использует отдельный loopback-порт настоящего nginx/FPM Local, без изменения общего router и доверия сертификатам. На сайте автора отзыва ничего не проверялось. Редактирование после возврата на 1.1.1 снова подвержено дефектам старой версии.

История предыдущего ZIP `1e5d3f0d…`: [первичная диагностика Beta 2](WP-7.2-BETA.md), [стабильная матрица](GAP-CLOSURE.md), [Native HTTPS/Site Domains](NATIVE-HTTPS.md). Их результаты и артефакты сохранены и не подменяют новую приёмку.

Более ранние материалы: [основная приёмка](FINAL-ACCEPTANCE.md), [Locale](LOCALE-VERIFICATION.md), [widget fallback](WIDGET-FALLBACK-VERIFICATION.md), [публичный 1.1.1 в LocalWP](LOCALWP-PUBLISHED-RECHECK.md), [ревью 5](FINAL-REVIEW-5.md), [numeric entities](NUMERIC-VERIFICATION.md), [HTML5](HTML5-VERIFICATION.md).
