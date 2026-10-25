#!/usr/bin/env bash

# run minimal HTTP-server for Render (web service)
node -e "require('http').createServer((req,res)=>res.end('OK')).listen(process.env.PORT || 8080)" &

node apps/cron-parser/dist/main.js &
node apps/alert/dist/main.js &
node apps/worker-telegram/dist/main.js &
node apps/worker-email/dist/main.js &
node apps/worker-push/dist/main.js &

wait