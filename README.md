# Warehouse Project

## Как запустить

1. Установите [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Клонируйте репозиторий
3. В корне проекта выполните:

```bash
docker-compose up --build
```

4. После запуска:
	API: http://localhost:5000/api-docs
	Frontend: http://localhost:3000

	
'Первый запуск может занять несколько минут (сборка образов и инициализация БД).'




З.Ы. 

пока рефакторю

поправить строку подключения к БД в "Warehouse\WarehouseAPI\appsettings.json" для Docker на "Server=db;Database=Warehouse;User=sa;Password=YourStrong@Pass123;TrustServerCertificate=True; 

или на свою если сервер отличается, в остальном миграции автоматически применятся - создание БД и тестовые данные


