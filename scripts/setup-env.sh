#!/bin/bash
# ==============================================================================
# Dynamic Environment Auto-Detection Script (Local & Production Flexibility)
# ==============================================================================

ENV_FILE=".env"
EXAMPLE_FILE=".env.example"

if [ ! -f "$ENV_FILE" ]; then
    if [ -f "$EXAMPLE_FILE" ]; then
        cp "$EXAMPLE_FILE" "$ENV_FILE"
        echo "Created .env from .env.example"
    else
        echo "Error: .env.example file not found!"
        exit 1
    fi
fi

# Detect environment: Check if running on AWS EC2 vs Local
IS_EC2=false
if curl -s --connect-timeout 2 http://169.254.169.254/latest/meta-data/instance-id > /dev/null; then
    IS_EC2=true
    PUBLIC_IP=$(curl -s --connect-timeout 2 http://169.254.169.254/latest/meta-data/public-ipv4 || curl -s --connect-timeout 2 ifconfig.me)
fi

if [ "$IS_EC2" = true ] && [ -n "$PUBLIC_IP" ]; then
    echo "Detected AWS EC2 Environment! Host Public IP: $PUBLIC_IP"
    sed -i "s/^SERVER_NAME=.*/SERVER_NAME=$PUBLIC_IP/" "$ENV_FILE"
    sed -i "s/^BIND_IP=.*/BIND_IP=0.0.0.0/" "$ENV_FILE"
else
    echo "Detected Local / Standard Environment. Using wildcard bind settings."
    sed -i "s/^SERVER_NAME=.*/SERVER_NAME=localhost/" "$ENV_FILE"
    sed -i "s/^BIND_IP=.*/BIND_IP=0.0.0.0/" "$ENV_FILE"
fi

echo "Environment configuration complete. Current .env settings:"
grep -E "SERVER_NAME|BIND_IP|NGINX_PORT" "$ENV_FILE"
