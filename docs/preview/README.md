# WordPress.org Live Preview

Текущий статус: опубликован только blueprint в **r3773659**. Обычная публичная кнопка прошла 37/37 проверок; код, версия 1.1.2 и оба ZIP неизменны. См. [публикацию и финальную приёмку](PUBLICATION.md).

Исходники демо отделены от устанавливаемого плагина:

- `wordpress/preview/seed.php` — страница пошагового демо с одним настоящим Gutenberg-блоком, шаблон и настройки временного WordPress.
- `wordpress/preview/demo.css` — оформление демо без изменения shadow DOM часов.
- `wordpress/preview/demo.js` — выбор оформления/города, живой результат, установка и переход в редактор.
- `wordpress/preview/config.json` — три оформления, каталог городов и исходные настройки.
- `wordpress/preview/clock.php` — общая нативная сериализация блока для seed и сохранения.
- `wordpress/preview/runtime.php` — только для демо: выдача конфигурации, подключение JS и защищённое REST-сохранение.
- `scripts/build-wordpress-preview.mjs` — сборка одного самодостаточного JSON.
- `wordpress/wporg-assets/blueprints/blueprint.json` — готовый файл для SVN `assets/blueprints/blueprint.json`.
- `docs/preview/blueprint-before.json` — исходный публичный файл SVN r3772712 для отката.
- `docs/preview/blueprint-gallery.json` — предыдущий локальный вариант с галереей; на WordPress.org не публиковался.

ZIP плагина и его версия не меняются. Существующие изменения `wordpress/simple-digital-clock/readme.txt` не относятся к этому демо.

## Сборка

```bash
set -euo pipefail
php -l wordpress/preview/seed.php
node scripts/build-wordpress-preview.mjs --build
node scripts/build-wordpress-preview.mjs --check
git diff --check -- . ':(exclude)wordpress/simple-digital-clock/readme.txt'
```

`seed.php` исполняется только внутри временного Playground после установки плагина и темы Twenty Twenty-Five. Тема явно задана, чтобы смена темы по умолчанию не меняла демо. Шаблон содержит один `main` с содержимым страницы; лишних заголовков и навигации темы нет.

Скрипт повторно использует страницу по slug и шаблон текущей темы. Чужие записи не удаляются. Ссылка в редактор создаётся через `admin_url()` и фактический ID страницы, включая адрес экземпляра Playground.

Сценарий: выбрать Classic/Minimal/Bold → выбрать город или ввести IANA time zone → нажать Show my clock → перейти к установке. На мобильном успешное применение города прокручивает к результату и переводит фокус на его заголовок. Неизвестный город показывает ошибку, сохраняя предыдущие часы. Список из 42 городов и aliases работает локально; геолокация и внешний поиск не используются.

Показан один настоящий web component установленного плагина. Системный шрифт исключает зависимость от Google Fonts. PHP networking отключён; загрузчик Blueprint получает ZIP плагина и темы самостоятельно. Дополнительная ссылка переносит выбранные настройки в настоящий Gutenberg-блок через REST, nonce и проверку edit_post. Установка на собственном сайте выполняется самим посетителем по инструкции.

JSON создаёт файлы `wp-content/mu-plugins/sdc-preview.php` и `wp-content/mu-plugins/sdc-preview/{clock.php,demo.js}` только во временном Playground. Эти файлы не входят в ZIP плагина и не создаются на сайтах пользователей при его установке.

## Проверка

Актуальные результаты пошагового сценария описаны в `GUIDED-VERIFICATION.md`. `VERIFICATION.md` сохраняет историческую проверку предыдущей локальной галереи.

Для локального smoke используется отдельный официальный `@wp-playground/cli@3.1.61`, установленный в игнорируемую `.local/wordpress-preview-runtime/`. Зависимости основного проекта не меняются. В локальной копии CLI listener ограничен `127.0.0.1`, а cache перенесён из home в `.local/wordpress-preview-runtime/cache`. Эти две настройки инфраструктуры не меняют исполняемый Blueprint или WordPress. Команда ниже относится к этой подготовленной локальной копии; стандартный CLI без ограничения listener использовать не следует.

```bash
set -euo pipefail
.local/wordpress-preview-runtime/node_modules/.bin/wp-playground-cli server \
  --port=19644 --php=8.3 \
  --blueprint=wordpress/wporg-assets/blueprints/blueprint.json \
  --verbosity=normal --workers=6
```

В другом терминале из корня репозитория:

```bash
set -euo pipefail
node tools/wordpress-preview/guided-smoke.mjs "manual-$(date +%Y%m%d-%H%M%S)" chromium
```

Guided smoke работает только с `127.0.0.1:19644`: проверяет выбор стиля/города, ошибки и XSS, обновление времени, мобильную прокрутку, ширины 320/390/768/1280 px, установку, защиту REST и сохранение настроек в валидный Gutenberg-блок. Временная конфигурация восстанавливается после проверки. Результаты и скриншоты записываются в новый каталог `.local/wordpress-preview-evidence/`; существующие результаты не перезаписываются. Старый `smoke.mjs` относится только к сохранённой версии галереи.

Не используйте старые cookies после пересоздания локального WordPress: cookie автоматического входа может пережить временный сайт, тогда как его ключи авторизации уже изменились. Проверяйте новый экземпляр в новом browser context.

## Публикация и откат

Публикация — отдельный шаг после просмотра результата. Нужен только SVN `assets/blueprints/blueprint.json`; `trunk`, теги, ZIP и `readme.txt` в эту публикацию не входят. Включённый публичный переключатель Preview менять не нужно.

Перед публикацией повторно прочитайте удалённый файл, сравните его с `blueprint-before.json` и проверьте локальный `svn diff`. Если upstream изменился, сначала разберите разницу. После публикации проверьте новый `rev` в ссылке Live Preview и запустите его в чистом браузере.

Для отката опубликуйте сохранённый `blueprint-before.json` в тот же SVN-путь. Это возвращает прежнее демо без изменения установленного плагина.

Официальный контракт: [Previews and Blueprints](https://developer.wordpress.org/plugins/wordpress-org/previews-and-blueprints/).
