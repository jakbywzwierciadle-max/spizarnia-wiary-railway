FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ffmpeg \
        python3-pip && \
    rm -rf /var/lib/apt/lists/*

# yt-dlp + EJS solver + link do node (Playwright już ma Node)
RUN pip install --upgrade yt-dlp && \
    pip install --upgrade yt-dlp[default] && \
    ln -s /usr/bin/node /usr/local/bin/node || true

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npx playwright install --with-deps chromium

EXPOSE 3000
CMD ["node", "server.js"]
