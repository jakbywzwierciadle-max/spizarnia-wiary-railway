FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app

# Instalujemy tylko ffmpeg z apt
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ffmpeg \
        python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Instalujemy najnowszy yt-dlp z pip (kluczowe!)
RUN pip install --upgrade yt-dlp

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npx playwright install --with-deps chromium

EXPOSE 3000
CMD ["node", "server.js"]
