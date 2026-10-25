#!/bin/sh
node dist/apps/cron-parser/main.js &
node dist/apps/alert/main.js &
node dist/apps/worker-telegram/main.js &
node dist/apps/worker-email/main.js &
node dist/apps/worker-push/main.js &
wait -n