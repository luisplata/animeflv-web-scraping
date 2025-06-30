FROM mcr.microsoft.com/playwright:v1.50.1-jammy

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Instala cron
RUN apt-get update && apt-get install -y cron

# Da permisos de ejecución al script
RUN chmod +x /app/run-tests.sh

# Copia el archivo de cron y lo registra
COPY crontab /etc/cron.d/animeflv-cron
RUN chmod 0644 /etc/cron.d/animeflv-cron && crontab /etc/cron.d/animeflv-cron

# Inicia cron en primer plano
CMD ["bash", "-c", "while true; do /app/run-tests.sh; sleep 600; done"]