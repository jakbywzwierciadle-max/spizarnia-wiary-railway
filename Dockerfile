FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ffmpeg \
        python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Najnowszy yt-dlp + JS runtime
RUN pip install --upgrade yt-dlp && \
    ln -s /usr/bin/node /usr/local/bin/node

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npx playwright install --with-deps chromium

EXPOSE 3000
CMD ["node", "server.js"]
