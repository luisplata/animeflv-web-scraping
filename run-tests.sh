#!/bin/bash

cd /app

npm run test -- tests/AnimeFLV/test/GetAllEpisodesByAnimeName.spec.ts
npm run test -- tests/AnimeFLV/test/AllAnimesByDay.spec.ts
npm run test -- tests/AnimeFLV/test/GetGenreByAnimeName.spec.ts
npm run test -- tests/AnimeFLV/test/GetGenreByAnimeName.spec.ts