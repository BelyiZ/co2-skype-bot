# co2-skype-bot
Бот для Skype, который публикует уровень CO2 в офисе

# Запуск

Скачиваем готовый image с DockerHub:
`docker pull belyiz/co2-skype-bot`

Пример команды запуска:
`docker run -p 8000:3978 -d "belyiz/co2-skype-bot"`

**При запуске необходимо указать переменные окружения:**
* `PORT` (по умолчанию 3978)
* `MICROSOFT_APP_ID`
* `MICROSOFT_APP_PASSWORD`
* `CO2_ENDPOINT`


