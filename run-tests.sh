#!/bin/bash

echo "========== $(date '+%Y-%m-%d %H:%M:%S') ==========" >> /app/cron.log

cd /app

npm run test -- tests/AnimeFLV/test/GetAllEpisodesByAnimeName.spec.ts >> /app/cron.log 2>&1
npm run test -- tests/AnimeFLV/test/AllAnimesByDay.spec.ts >> /app/cron.log 2>&1
npm run test -- tests/AnimeFLV/test/GetGenreByAnimeName.spec.ts >> /app/cron.log 2>&1
npm run test -- tests/AnimeFLV/test/GetAlterNamesByAnimeName.spec.ts >> /app/cron.log 2>&1