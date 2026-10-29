# Live Preview — опубликован r3773659

2026-10-29. **Публикация и фактическая выдача подтверждены.** Изменён только `assets/blueprints/blueprint.json`. Обычная кнопка WordPress.org запускает новый пошаговый сценарий; код, версия и оба ZIP плагина остались неизменными.

## Финальная приёмка

- Обычная [кнопка Live Preview](https://wordpress.org/plugins/simple-digital-clock/?preview=1), свежий Chromium: **37/37 PASS**, 16.527 секунды.
- Выбор оформления и города, дата/AM/PM, неизвестное значение/XSS, мобильный результат 320/390/768/1280 px, инструкция установки — PASS.
- Gutenberg: 11 валидных блоков, один реально отрисованный clock. Caption/custom gradient сохраняются после возврата; `preset:null` сохраняет собственное оформление.
- `pageErrors=0`, неожиданных HTTP-ошибок нет. Один HTTP 403 и три HTTP 400 созданы намеренными проверками валидации.
- После завершившегося импорта независимо повторена целостность: **19/19 PASS**, включая повторную загрузку обоих ZIP.
- Фактический браузерный redirect обновился до `rev=3773708`. Это параметр кэша импортированного metadata, а не ревизия публикации asset; commit остаётся r3773659.

Скриншоты desktop/mobile/install/editor проверены визуально. Финальные результаты относятся к обычной кнопке каталога, без подстановки локального blueprint или URL fragment.

## Публикация

- SVN: **r3773659**, автор `falselight`, `2026-10-29T17:47:03.155572Z` — 19:47 по Киеву.
- Единственный изменённый путь: `/simple-digital-clock/assets/blueprints/blueprint.json`.
- SVN properties не менялись.
- Размер: 62 422 bytes.
- SHA-256: `fc8d270ed0b2116688ec68203e7e8742d31016f08357c41da71bfcb9aea71d74`.
- SVN readback и публичный CDN `ps.w.org` побайтно совпадают с проверенным кандидатом.

До публикации точный кандидат прошёл 156/156 локальных проверок Chromium/WebKit и 36/36 в публичном браузерном WASM Playground через URL fragment. Эти проверки не подменяют повторную приёмку обычной кнопки WordPress.org после импорта metadata.

Первый non-interactive commit был отклонён с `E215004` и не создал ревизию. Пользователь выполнил подготовленный интерактивный скрипт; пароль вводился локально и не передавался в чат. Повторный commit не требуется.

## Неизменность плагина

Независимая проверка после SVN commit подтвердила:

- `trunk` и `tags/1.1.2`: все 15 файлов совпадают с эталонами перед публикацией.
- Версия header, Stable tag и plugins/info API: **1.1.2**.
- Оба публичных ZIP побайтно совпадают с эталонами перед публикацией: размер **61 476 bytes**, CRC OK, 15 файлов.
- SHA-256 обоих ZIP: `d07b5941279b0513d660ed9002eda360f9340bc95d5f21d43c2da712545acd55`.
- Все 39 локальных файлов plugin/src/dist неизменны. Предшествующая локальная правка `readme.txt` сохранена и не опубликована этим commit.
- Изолированный sparse SVN checkout чистый; прежний пользовательский checkout и untracked HTML-баннер не тронуты.

Эталоны относятся к состоянию непосредственно перед публикацией Live Preview, включая ранее опубликованное обновление readme. Они не подменяются исходным ZIP первого выпуска 1.1.2, упакованным ранее.

## Задержка каталога

Первичная проверка обычной [кнопки Live Preview](https://wordpress.org/plugins/simple-digital-clock/?preview=1) открыла старую девятичасовую галерею. Redirect содержал `rev=3772712`; API возвращал старый JSON даже с `rev=3773659`. При этом SVN и assets CDN уже отдавали новый файл. Следовательно, обновление asset подтверждено, а его выдача API на этом этапе ещё не была обновлена.

В `18:02:51 UTC` — 20:02:51 по Киеву — обычная кнопка уже ссылалась на API с новым содержимым. Нормализованный ответ: 62 476 bytes, SHA-256 `d2a18b6442fa66188854bb82a306ff04b4ccadee29f96720d5813892425ac864`; decoded JSON полностью совпал с кандидатом. Затем выполнены полный браузерный сценарий и окончательное сравнение ZIP после импорта.

Официальный [SVN watcher](https://github.com/WordPress/wordpress.org/blob/trunk/wordpress.org/public_html/wp-content/plugins/plugin-directory/cli/class-svn-watcher.php#L50-L53) добавляет `trunk` к assets-only событиям. [Очередь Plugin_Import](https://github.com/WordPress/wordpress.org/blob/trunk/wordpress.org/public_html/wp-content/plugins/plugin-directory/jobs/class-plugin-import.php#L130-L157) откладывает такой импорт на 15 минут. Это объяснение согласуется с наблюдениями; фактическое состояние production queue недоступно. Ориентир — после 20:02 по Киеву плюс обработка watcher/очереди.

API читает postmeta `assets_blueprints`, а не SVN напрямую; query-параметр `rev` не позволяет форсировать чтение. Новый commit обновил бы окно ожидания. Manual sync не вызывался, чтобы не запускать потенциально полный импорт и переупаковку ZIP.

Размер кандидата меньше официального лимита 100 KiB. Отдельное исполнение официальной `normalize_blueprint_json()` приняло файл: нормализованный ответ может иметь другой размер/SHA, но decoded JSON должен совпадать с кандидатом.

## Доказательства

- `.local/wordpress-preview-publication/commit-result.json` — commit, автор и scope.
- `.local/wordpress-preview-publication/committed-log.stdout` — независимый XML log.
- `.local/wordpress-preview-publication/post-publication-20261029T174839Z/summary.json` — SVN, ZIP, версия и первоначальная задержка API.
- `.local/wordpress-preview-publication/delivery-audit/diagnosis.json` — owning source, строки и границы вывода.
- `.local/wordpress-preview-publication/delivery-watch/` — ограниченное ожидание фактического обновления API.
- `.local/wordpress-preview-evidence/public-guided-published-01/cache-status.json` — реальный браузер на этапе старой выдачи.
- `.local/wordpress-preview-evidence/public-guided-published-02/results.json` — финальные 37/37 обычной публичной кнопки и PNG рядом.
- `.local/wordpress-preview-publication/post-import-final-20261029T180334Z/summary.json` — финальные 19/19 после импорта: код, версия, ZIP, SVN и API.
- `docs/preview/verification.json` — сводка текущего принятого состояния.

Все необходимые этапы завершены. Задержка каталога разрешилась без дополнительного commit, manual sync, изменения кода или переупаковки ZIP. Проверка публичного сценария выполнена в чистом Chromium; полная сертификация всех браузеров и assistive technology не заявляется.
