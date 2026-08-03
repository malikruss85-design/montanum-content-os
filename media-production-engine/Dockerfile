FROM node:24-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile --prod
COPY src ./src
COPY README.md ./README.md
RUN mkdir -p /var/lib/mpe/data /var/lib/mpe/logs /var/lib/mpe/output && chown -R node:node /var/lib/mpe
USER node
ENV MPE_ENV=production MPE_HOST=0.0.0.0 MPE_DATA_DIR=/var/lib/mpe/data MPE_LOG_DIR=/var/lib/mpe/logs MPE_OUTPUT_DIR=/var/lib/mpe/output MPE_FFMPEG_PATH=/usr/bin/ffmpeg
EXPOSE 4317
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD node -e "fetch('http://127.0.0.1:4317/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]
