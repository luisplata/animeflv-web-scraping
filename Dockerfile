FROM mcr.microsoft.com/playwright:v1.50.1-jammy

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Instala cron
RUN apt-get update && apt-get install -y cron

# Da permisos de ejecución al script
RUN chmod +x /app/run-tests.sh

# Inicia cron en primer plano
CMD ["bash", "-c", "while true; do /app/run-tests.sh; done"]