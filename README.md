# youTube


/etc/systemd/system/youtube-tg.service
/etc/systemd/system/youtube-cron.service

После создания юнитов (systemd обновил свою конфигурацию)
```
sudo systemctl daemon-reload
```

Запуск процессов
```
sudo systemctl start youtube-tg
sudo systemctl start youtube-cron
```

Автоматический запуск при старте системы
```
sudo systemctl enable youtube-tg
sudo systemctl enable youtube-cron
```

Стоп процессов
```
sudo systemctl stop youtube-tg
sudo systemctl stop youtube-cron
```

Выключение автоматического запуска при старте системы
```
sudo systemctl disable youtube-index
sudo systemctl disable youtube-cron
```
