# Simple Digital Clock 1.1.2 — локальная подготовка релиза

29 октября 2026. **Исправление KSES на WP 7.2 Beta 2 проверено. Git tree, ZIP, локальные SVN trunk и тег 1.1.2 содержат одинаковые 15 установочных файлов. Публикаций нет.**

- Ветка: `codex/prepare-simple-digital-clock-1.1.2`.
- Git tree установочного плагина: `18512403b0715be777a89e302831a3cc3d5117b6`.
- ZIP: `.local/packages/simple-digital-clock-1.1.2-candidate.zip`.
- ZIP SHA-256: `7a0e061fafa0e9b08c14b337ff8ced46be920119f368ff1d80815829cce839a8`.
- [Финальный smoke, Plugin Check и read-only SVN preflight](PREFLIGHT.md).
- [Синхронизация POT, граница функциональной приёмки и новая упаковка](METADATA-SYNC.md).
- [Манифест файлов](manifest.json), [diff trunk](svn-trunk.diff), [полная добавляемая копия тега](svn-tag-copy.diff).
- [Исправление и окончательная приёмка](../../patches/1.1.2/KSES72-VERIFICATION.md), [evidence](../../patches/1.1.2/kses72-evidence.json).

## Локальный SVN

Checkout: `/Users/yy/Documents/ChatGPT/WordPress/wp-plugin-work/simple-digital-clock/svn`. Base revision остаётся **r3771402**. В `trunk` относительно официальной 1.1.1 изменены `block.js`, `readme.txt`, `widget_init.php`; добавлен `includes/simple-digital-clock-kses.php`; обновлены метаданные и source references `languages/simple-digital-clock.pot`. Тег `tags/1.1.2` сохраняет состояние `A +` и copy-from `trunk@3771402`. Это локальная запланированная копия; её URL в `svn info` не означает существование тега на сервере.

Сначала синхронизирован POT, затем уточнены два пункта changelog о подтверждённых сценариях LocalWP. Последняя итерация обновила в обоих каталогах только `readme.txt`: перед копированием все файлы совпали с ZIP `e939a89b…`, после — с новым манифестом. Свойства не менялись, история копии сохранена. Посторонний незарегистрированный HTML-баннер в `assets/` сохранён побайтно и не добавлен в SVN.

Plain SVN diff сохранён побайтно, включая CRLF. Dry-run и применение diff к чистой копии официальной 1.1.1 дали точно 15 файлов окончательного ZIP. Статус SVN сравнен структурно: порядок XML-атрибутов между процессами может отличаться. Для тега использован штатный `svn diff --show-copies-as-adds`.

## Проверка и откат

Функциональные результаты относятся к коммиту `9dd7c53` и ZIP `6f896d42…`: 18 336 PHP-проверок, 1 309 248 DOM-сравнений, браузерные сценарии обновления/пересохранения/отката, LocalWP, multisite, темы/кеши и Native HTTPS. Формат хранения и исходники standalone-виджета в исправлении KSES не менялись. Поле `Tested up to: 7.1` сохранено. Новая упаковка меняет только metadata/source references POT и две формулировки changelog о LocalWP; остальные 13 файлов идентичны. Для неё проверены gettext, ZIP, манифесты и применение diff; полная функциональная матрица повторно не запускалась. После синхронизации точный финальный ZIP отдельно прошёл 1388 smoke-утверждений; PCP завершился с 0 ERROR / 7 разобранными WARNING.

Старые исходники, ZIP, исходный SVN-статус и подготовка сохранены в `.local/release-prep-1.1.2/` и `.local/wordpress-lab/kses72-fix/`; снимки до синхронизации POT — `.local/docs-sync-1.1.2/`, до уточнения changelog — `.local/localwp-changelog-1.1.2/`; снимок перед исправлением KSES в SVN — `.local/wordpress-lab/kses72-final/svn-prep/`. Для отмены требуется точечный возврат файлов соответствующей итерации, без очистки checkout и без затрагивания баннера. Откат установленного плагина на 1.1.1 проверен поверх пересохранённых данных, без восстановления БД; он не исправляет ранее испорченные данные и возвращает известные дефекты редактирования 1.1.1.

Git push, SVN commit и remote SVN copy не выполнялись. Публикация требует отдельного разрешения и новой проверки удалённого состояния. В её область не включать `assets/`. Runtime-данные стендов, дампы, credentials и TLS-материалы не добавлены в Git.
