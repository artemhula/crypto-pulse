#!/bin/sh

# run minimal  HTTP-server for Render (web service)
node -e "require('http').createServer((req,res)=>res.end('OK')).listen(process.env.PORT || 8080)" &

node dist/apps/cron-parser/main.js &
node dist/apps/alert/main.js &
node dist/apps/worker-telegram/main.js &
node dist/apps/worker-email/main.js &
node dist/apps/worker-push/main.js &

wait -n