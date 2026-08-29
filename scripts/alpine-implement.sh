#!/bin/bash

docker exec -it alpine sh
apk add curl
curl http://prometheus:9090/-/healthy
curl http://yace:5000/metrics
curl http://node-exporter:9100/metrics
curl http://cadvisor:8080/metrics
