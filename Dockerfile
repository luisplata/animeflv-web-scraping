FROM mcr.microsoft.com/playwright:v1.50.1-jammy

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chmod +x /app/run-tests.sh

# CMD por defecto, se sobrescribe en docker-compose.yml
CMD ["bash"]