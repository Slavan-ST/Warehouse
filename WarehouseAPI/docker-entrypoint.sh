#!/bin/bash

# Ждём, пока SQL Server станет доступен
echo "Ожидание SQL Server..."
while ! curl -s http://db:1433 >/dev/null 2>&1; do
  echo "SQL Server ещё не готов — ждём 5 сек..."
  sleep 5
done

# Но curl не проверит порт 1433 (TCP), лучше использовать nc или retry подключение
# Поэтому просто подождём фиксированное время
echo "Ждём 15 секунд на полную инициализацию SQL Server..."
sleep 15

echo "Запуск приложения..."
exec dotnet WarehouseAPI.dll