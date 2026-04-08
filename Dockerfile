FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        pip install --no-cache-dir -U yt-dlp \
        ffmpeg && \
    rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npx playwright install --with-deps chromium

EXPOSE 3000
CMD ["node", "server.js"]
