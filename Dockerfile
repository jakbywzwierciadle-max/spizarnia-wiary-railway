FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app

# Instalujemy yt-dlp natywnie
RUN apt-get update && apt-get install -y yt-dlp ffmpeg

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npx playwright install --with-deps chromium

EXPOSE 3000

CMD ["node", "server.js"]
