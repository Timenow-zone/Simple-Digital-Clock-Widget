# Пошаговый Live Preview — локальная приёмка 2026-10-29

Готовая страница: `http://127.0.0.1:19644/`.

Blueprint: `wordpress/wporg-assets/blueprints/blueprint.json`, 62 422 bytes, SHA-256 `fc8d270ed0b2116688ec68203e7e8742d31016f08357c41da71bfcb9aea71d74`.

## Сценарий посетителя

1. Выбрать Classic, Minimal или Bold. Меняется оформление настоящего clock-компонента плагина, а не отдельной имитации часов.
2. Выбрать город из локального списка или ввести IANA time zone. Есть 42 города, включая несколько городов с одинаковым часовым поясом и aliases. Геолокация и внешний поиск не вызываются.
3. Нажать `Show my clock`. Применяются город, часовой пояс, дата и формат времени. На мобильном фокус и прокрутка переводятся к видимому результату. Неизвестное значение показывает ошибку, сохраняя предыдущие часы.
4. Нажать `Add this clock to my site`. Раскрывается инструкция установки через собственную админку WordPress и ссылка на официальный каталог. Демо не заявляет, что установило плагин на сайт посетителя.

Дополнительная ссылка открывает выбранный блок в Gutenberg. Если посетитель менял builder, выбранные параметры сначала сохраняются в эту временную страницу. Если изменений не было, переход выполняется напрямую. В редакторе скрыты элементы frontend-демо; посетитель видит реальный блок часов.

Сохранённый блок служит источником истины при возврате на frontend. Собственные Caption и оформление из Gutenberg не заменяются устаревшим preset. Если посетитель изменяет только город/дату собственного оформления, REST получает `preset:null` и сохраняет существующие стили. Reset возвращает локальный frontend к Classic/Kyiv; обычные взаимодействия с формой не пишут в базу до перехода в редактор.

## Область изменений

- `wordpress/preview/seed.php` — страница и нативная структура блоков.
- `wordpress/preview/demo.css` — frontend и отдельное представление редактора.
- `wordpress/preview/demo.js` — сценарий, валидация и управление настоящим custom element.
- `wordpress/preview/config.json` — общие presets/cities.
- `wordpress/preview/clock.php` — общая нативная сериализация блока.
- `wordpress/preview/runtime.php` — preview-only mu-plugin с конфигурацией, JS и REST.
- `scripts/build-wordpress-preview.mjs` — один самодостаточный JSON для будущей публикации.
- `tools/wordpress-preview/guided-smoke.mjs` — приёмка сценария.

Устанавливаемый плагин и его bundle не менялись. Предшествующие изменения `readme.txt` сохранены. Mu-plugin создаётся только внутри временного Playground, а не на сайтах, устанавливающих Simple Digital Clock.

## Результаты

Официальный Playground CLI 3.1.61, PHP 8.3, WordPress 7.1.4. Listener ограничен loopback. Browser contexts свежие, без очистки пользовательского профиля.

| Проверка | Chromium | WebKit |
| --- | --- | --- |
| Полный сценарий | 78/78 PASS | 78/78 PASS |
| 320/390/768/1280 px | Без overflow/обрезки | Без overflow/обрезки |
| Mobile Submit → focus → весь clock виден | PASS | PASS |
| Выбор style клавиатурой, город, date, AM/PM | PASS | PASS |
| Unknown city/XSS не заменяют предыдущий clock | PASS | PASS |
| Установка: раскрытие, фокус, правильная инструкция | PASS | PASS |
| Nonce/невалидные значения/строковые boolean | Отклонены | Отклонены |
| Отвергнутые запросы не меняют raw post content | PASS | PASS |
| Gutenberg: 11 блоков, включая 1 clock | Все валидны | Все валидны |
| Native Caption/собственный gradient → frontend | Сохранены | Сохранены |
| `preset:null` сохраняет собственное оформление | PASS | PASS |
| Google Fonts / uncaught exceptions | 0 / 0 | 0 / 0 |

REST проверяет `edit_post` для единственной настроенной страницы и штатный `wp_rest` nonce. Принимаются только пять полей с явными типами. Город и timezone валидируются; регистр IANA приводится к имени из PHP tzdb. Обновляется ровно один блок в группе `sdc-live-result`; при неоднозначности возвращается ошибка. JSON для HTML защищён `JSON_HEX_*`, пользовательский текст не вставляется через `innerHTML`.

Оба прогона восстановили серверную конфигурацию Classic/Kyiv. Основной тест не посещает внешние ссылки установки и не устанавливает плагин на другие сайты.

## Доказательства и воспроизведение

- `.local/wordpress-preview-evidence/guided-acceptance-03-chromium/results.json`
- `.local/wordpress-preview-evidence/guided-acceptance-03-webkit/results.json`
- Рядом: `guided-initial-desktop.png`, `guided-mobile-after-submit.png`, `guided-installation.png`, `guided-editor.png`, `guided-final-desktop.png`.
- Сводка с SHA и областью проверки: `docs/preview/verification.json`.

```bash
set -euo pipefail
php -l wordpress/preview/seed.php
php -l wordpress/preview/runtime.php
php -l wordpress/preview/clock.php
node --check wordpress/preview/demo.js
node scripts/build-wordpress-preview.mjs --check
node tools/wordpress-preview/guided-smoke.mjs "guided-chromium-$(date +%Y%m%d-%H%M%S)" chromium
node tools/wordpress-preview/guided-smoke.mjs "guided-webkit-$(date +%Y%m%d-%H%M%S)" webkit
```

Команды требуют подготовленного локального CLI из `README.md`. Доказательства создаются в новом каталоге и не перезаписываются.

## Границы и откат

После локальной приёмки пользователь разрешил проверку в публичном Playground и публикацию только Live Preview. Точный JSON прошёл полный публичный WASM-сценарий: **36/36 PASS**, 25.5 секунды, `pageErrors=0`. Проверены мобильные ширины, установка, REST-защита, реальный canvas Gutenberg, сохранение Caption/custom gradient и возврат. Намеренные проверки валидации дали один HTTP 403 и три HTTP 400; они не являются сбоями демо. Доказательства: `.local/wordpress-preview-evidence/public-guided-candidate-01/results.json` и PNG рядом.

Публикация выполнена в **r3773659** после интерактивной SVN-аутентификации пользователем; изменён только blueprint. После штатной задержки импорта обычная кнопка WordPress.org прошла **37/37 PASS** в чистом Chromium. Отдельные **19/19 проверок целостности после импорта** подтвердили неизменность кода, версии 1.1.2 и обоих ZIP побайтно. Подробности, SHA и evidence — в [отчёте публикации](PUBLICATION.md).

Улучшение конверсии — цель сценария; A/B-тест и измерение установок не проводились. Полная сертификация WCAG и проверка всех браузеров/assistive technology не заявляются.

Предыдущий локальный вариант сохранён в `blueprint-gallery.json`; исходный публичный — в `blueprint-before.json`. Исходники прежнего локального варианта находятся в `.local/wordpress-preview-before-guided/`. Откат затрагивает только демо. На WordPress.org опубликован только `assets/blueprints/blueprint.json`.
