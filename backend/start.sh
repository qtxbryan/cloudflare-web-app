#!/bin/bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
  -o cloudflared && chmod +x cloudflared

./cloudflared tunnel --no-autoupdate run --token $TUNNEL_TOKEN &

uvicorn main:app --host 0.0.0.0 --port $PORT