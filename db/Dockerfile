# db/Dockerfile
FROM mcr.microsoft.com/mssql/server:2022-latest

# Переключаемся на root
USER root

# Устанавливаем curl и gnupg
RUN apt-get update && \
    apt-get install -y curl gnupg && \
    rm -rf /var/lib/apt/lists/*

# Добавляем ключ Microsoft
RUN curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /etc/apt/trusted.gpg.d/microsoft.gpg

# Добавляем репозиторий
RUN curl -fsSL https://packages.microsoft.com/config/ubuntu/20.04/prod.list > /etc/apt/sources.list.d/msprod.list

# Обновляем пакеты
RUN apt-get update

# Скачиваем пакеты, но НЕ устанавливаем
RUN ACCEPT_EULA=Y apt-get install -y --download-only mssql-tools18 unixodbc-dev

# Принудительно устанавливаем .deb файлы с перезаписью
RUN dpkg -i --force-overwrite /var/cache/apt/archives/*.deb || true

# Исправляем зависимости
RUN apt-get install -f -y

# Очищаем кеш
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*.deb

# Добавляем в PATH
ENV PATH="/opt/mssql-tools18/bin:${PATH}"

# Возвращаем пользователя mssql
USER mssql