# Monitoring Stack

A flexible, production-ready monitoring stack using Docker Compose, Prometheus, Grafana, Loki, Alloy, YACE, Node Exporter, cAdvisor, and Nginx Gateway.

---

## 🌐 Unified Access URLs (Port 80)

With the **Nginx Gateway**, you can access all services through a single port (`80`) using path prefixes both locally and in production:

| Service | Access URL (Local / Production) |
| :--- | :--- |
| **Gateway Landing Page** | `http://localhost/` or `http://<your-domain>/` |
| **Grafana Dashboard** | `http://localhost/grafana/` or `http://<your-domain>/grafana/` |
| **Prometheus UI** | `http://localhost/prometheus/` or `http://<your-domain>/prometheus/` |
| **Node Exporter Metrics** | `http://localhost/node-exporter/metrics` or `http://<your-domain>/node-exporter/metrics` |
| **cAdvisor Metrics** | `http://localhost/cadvisor/metrics` or `http://<your-domain>/cadvisor/metrics` |
| **YACE Metrics** | `http://localhost/yace/metrics` or `http://<your-domain>/yace/metrics` |

---

## ⚙️ Environment Configuration (`.env`)

Configure `.env` for your deployment environment:

### Local Development (`127.0.0.1` / `localhost`):
```env
BIND_IP=0.0.0.0      # Or 127.0.0.1 for strictly local-only binding
SERVER_NAME=localhost
NGINX_PORT=80
```

### Production Deployment (`your-domain.com`):
```env
BIND_IP=0.0.0.0
SERVER_NAME=monitoring.yourdomain.com
NGINX_PORT=80
```

---

## 🚀 Getting Started

1. Copy `.env.example` to `.env` if not already created:
   ```bash
   cp .env.example .env
   ```

2. Start the monitoring stack:
   ```bash
   docker compose up -d
   ```

3. Open `http://localhost/` in your browser!

