# 📊 Production-Ready Monitoring & Observability Stack

A flexible, full-featured monitoring and observability stack powered by **Docker Compose**, integrating metrics collection, log aggregation, cloud metrics exporting, and a modern, interactive **Nginx Gateway**.

---

## 🏗️ Architecture Overview

This stack integrates metrics, logs, and cloud telemetry into a unified dashboard experience:

```
                                 ┌────────────────────────┐
                                 │   User / Web Browser   │
                                 └───────────┬────────────┘
                                             │ Port 80
                                             ▼
                                 ┌────────────────────────┐
                                 │     Nginx Gateway      │
                                 │  (Glassmorphism Hub)   │
                                 └────┬──────┬──────┬─────┘
                                      │      │      │
            ┌─────────────────────────┘      │      └─────────────────────────┐
            │ /grafana/                      │ /prometheus/                   │ /loki/
            ▼                                ▼                                ▼
  ┌───────────────────┐            ┌───────────────────┐            ┌───────────────────┐
  │      Grafana      │            │    Prometheus     │            │       Loki        │
  │ (Dashboards & UI) │            │ (Metrics Storage) │            │  (Log Storage)    │
  └─────────▲─────────┘            └▲─────────▲────────┘            └─────────▲─────────┘
            │                       │         │                               │
            │ Datasources           │ Scrapes │ Remote Write                  │ Pushes Logs
            └───────────────────────┼─────────┼───────────────────────────────┤
                                    │         │                               │
                      ┌─────────────┴┐   ┌────┴────────────┐       ┌──────────┴────────┐
                      │ YACE         │   │ Grafana Alloy   │───────► Docker Engine     │
                      │ (CloudWatch) │   │ (Collector)     │       │ (/var/run/docker) │
                      └──────┬───────┘   └────▲───────▲────┘       └───────────────────┘
                             │                │       │
                             ▼                │ Scrapes
                      ┌──────────────┐        │       │
                      │ AWS Cloud    │   ┌────┴───┐ ┌─┴─────────┐
                      │ Services     │   │ Node   │ │ cAdvisor  │
                      └──────────────┘   │Export. │ │ Containers│
                                         └────────┘ └───────────┘
```

### Component Roles & Responsibilities

| Service | Container Name | Description | Internal Port |
| :--- | :--- | :--- | :--- |
| **Nginx Gateway** | `nginx-gateway` | Reverse proxy routing subpaths (`/grafana/`, `/prometheus/`, `/loki/`) through port 80 and hosting the live landing page. | `80` |
| **Grafana** | `grafana` | Visualization platform provisioned with Prometheus and Loki datasources and pre-loaded dashboards. | `3000` |
| **Prometheus** | `prometheus` | Time-series metrics engine scraping Node Exporter, cAdvisor, YACE, and receiving Alloy remote-writes. | `9090` |
| **Loki** | `loki` | High-efficiency log aggregation system storing logs collected from Docker containers. | `3100` |
| **Grafana Alloy** | `alloy` | Telemetry collector forwarding container logs to Loki and system metrics to Prometheus. | — |
| **Node Exporter** | `node-exporter` | Collects host machine system metrics (CPU, RAM, Disk, OS parameters). | `9100` |
| **cAdvisor** | `cadvisor` | Analyzes resource usage and performance characteristics of running Docker containers. | `8080` |
| **YACE** | `yace` | Yet Another CloudWatch Exporter querying AWS CloudWatch metrics (e.g., EC2 stats). | `5000` |
| **Alpine** | `alpine` | Lightweight utility container kept active for network testing and in-cluster debugging. | — |

---

## 🌐 Unified Access URLs & Health Endpoints (Port 80)

All services are accessible through a single HTTP entrypoint (Port `80`) with subpath routing and health check probes:

| Endpoint / Service | Subpath URL | Health Check Probe | Status / Target |
| :--- | :--- | :--- | :--- |
| **Gateway Landing Page** | `http://localhost/` | `/` | Serves interactive glassmorphism UI |
| **Grafana Dashboards** | `http://localhost/grafana/` | `/grafana/api/health` | Web interface for dashboards & alerts |
| **Prometheus UI** | `http://localhost/prometheus/` | `/prometheus/-/healthy` | PromQL query console & target discovery |
| **Loki Status** | `http://localhost/loki/ready` | `/loki/ready` | Health check returning `ready` |
| **Node Exporter Metrics** | `http://localhost/node-exporter/metrics` | `/node-exporter/metrics` | Raw host telemetry metrics |
| **cAdvisor Metrics** | `http://localhost/cadvisor/metrics` | `/cadvisor/metrics` | Raw Docker container metrics |
| **YACE Metrics** | `http://localhost/yace/metrics` | `/yace/metrics` | Raw AWS CloudWatch metrics |

---

## 🎨 Interactive Gateway Dashboard Features

The Nginx Gateway hosts a modern, responsive HTML/JS dashboard ([nginx/html/index.html](file:///d:/Ez_Softech/monitoring-stack/nginx/html/index.html)):

- ⚡ **Real-time Health Monitoring**: Asynchronously pings all 6 services every 15 seconds, displaying live status badges (`ONLINE (latency ms)` or `OFFLINE`).
- 🎨 **Glassmorphism Dark Theme**: Designed with smooth gradients, card hover animations, and Inter typography.
- 📋 **One-Click URL Copying**: Toast notification buttons to quickly copy API and metric endpoint URLs.
- 🚀 **Zero External Dependencies**: Standalone HTML5/CSS3/Vanilla JS served directly by Nginx.

---

## 📊 Pre-Configured Grafana Dashboards

The stack automatically provisions 5 ready-to-use Grafana dashboards ([grafana/dashboards/](file:///d:/Ez_Softech/monitoring-stack/grafana/dashboards/)):

1. 🖥️ **System Node Exporter** (`system-node-exporter.json`): Host CPU total usage, Memory consumption, Disk I/O, Network traffic, and System Uptime.
2. 🐳 **Docker cAdvisor** (`docker-cadvisor.json`): Per-container CPU usage, memory utilization, container network stats, and process counts.
3. ☁️ **AWS CloudWatch / YACE** (`aws-cloudwatch-yace.json`): EC2 CPU utilization, network in/out rates, and CloudWatch metrics.
4. 🔥 **Prometheus Health** (`prometheus-health.json`): Scrape durations, target health indicators, and active TSDB head series count (`11,000+` series).
5. 🪵 **Loki Container Logs** (`loki-logs.json`): Real-time log stream search and log volume frequency grouped by container.

> [!NOTE]
> All dashboards are bound to default provisioned datasources with explicit UIDs: `Prometheus` and `Loki`.

---

## ⚙️ Environment Configuration (`.env`)

Environment variables configure networking, server hostnames, credentials, and CloudWatch access.

### 1. Copy Example Environment File
```bash
cp .env.example .env
```

### 2. Environment Variable Reference

| Variable Name | Default Value | Description |
| :--- | :--- | :--- |
| `BIND_IP` | `0.0.0.0` | Host IP binding (`0.0.0.0` for network access, `127.0.0.1` for local only). |
| `SERVER_NAME` | `127.0.0.1` | Hostname/IP used by Nginx (`server_name`), Grafana root URL, and Prometheus external URL. |
| `NGINX_PORT` | `80` | External HTTP port exposed by Nginx Gateway. |
| `GRAFANA_ADMIN_USER` | `admin` | Admin username for Grafana login. |
| `GRAFANA_ADMIN_PASSWORD` | `Admin@123` | Admin password for Grafana login. |
| `AWS_REGION` | `eu-north-1` | Target AWS region for YACE CloudWatch metric queries. |
| `AWS_ACCESS_KEY_ID` | *(Set in `.env`)* | AWS access key for YACE CloudWatch authentication. |
| `AWS_SECRET_ACCESS_KEY` | *(Set in `.env`)* | AWS secret key for YACE CloudWatch authentication. |
| `PROMETHEUS_PORT` | `9090` | Host port for direct Prometheus access. |
| `GRAFANA_PORT` | `3000` | Host port for direct Grafana access. |
| `LOKI_PORT` | `3100` | Host port for direct Loki access. |
| `YACE_PORT` | `5000` | Host port for direct YACE access. |
| `NODE_EXPORTER_PORT` | `9100` | Host port for direct Node Exporter access. |
| `CADVISOR_PORT` | `8080` | Host port for direct cAdvisor access. |

---

## 🚀 Getting Started

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)

### Launching the Stack

1. **Initialize `.env`**:
   ```bash
   cp .env.example .env
   ```

2. **Start Services in Background**:
   ```bash
   docker compose up -d
   ```

3. **Verify Container Health**:
   ```bash
   docker compose ps
   ```

4. **Access the Landing Page**:
   Open [`http://localhost/`](http://localhost/) (or `http://127.0.0.1/`) in your browser.

---

## 🛠️ Management & Troubleshooting

### Subpath Reverse Proxy Configuration Notes
- **Grafana Subpath**: Configured via `GF_SERVER_ROOT_URL: "http://${SERVER_NAME}:${NGINX_PORT}/grafana/"` and `GF_SERVER_SERVE_FROM_SUB_PATH: "true"`. Nginx proxies `/grafana/` to `http://grafana:3000`.
- **Prometheus Subpath**: Configured via `--web.external-url=http://${SERVER_NAME}:${NGINX_PORT}/prometheus/` and `--web.route-prefix=/prometheus/`. Grafana datasource URL points to `http://prometheus:9090/prometheus/`.
- **Loki Endpoint**: Configured via `location /loki/` proxying to `http://loki:3100/`.

### Viewing Logs
```bash
# View logs for all services
docker compose logs -f

# View logs for a specific service
docker compose logs -f nginx-gateway
docker compose logs -f grafana
docker compose logs -f prometheus
```

### Resetting & Re-provisioning
```bash
# Restart all services
docker compose restart

# Tear down stack and persistent data volumes
docker compose down -v

# Rebuild and launch fresh stack
docker compose up -d
```

---

## 📁 Directory Structure

```
.
├── docker-compose.yml              # Main container orchestration file
├── .env.example                    # Template for environment variables
├── .env                            # Active environment configuration
├── README.md                       # Documentation and usage guide
├── alloy/
│   └── config.alloy                # Grafana Alloy telemetry pipeline config
├── grafana/
│   ├── dashboards/                 # Pre-configured Grafana JSON dashboards
│   │   ├── aws-cloudwatch-yace.json
│   │   ├── docker-cadvisor.json
│   │   ├── loki-logs.json
│   │   ├── prometheus-health.json
│   │   └── system-node-exporter.json
│   └── provisioning/
│       ├── dashboards/dashboards.yml # Automatic dashboard loader
│       └── datasources/datasources.yml # Automatic Prometheus & Loki datasource provisioning
├── loki/
│   └── config.yml                  # Loki storage and schema configuration
├── nginx/
│   ├── html/
│   │   └── index.html              # Glassmorphic Gateway landing page with live health checks
│   └── templates/
│       └── default.conf.template   # Nginx Gateway reverse proxy configuration
├── prometheus/
│   └── prometheus.yml              # Prometheus scrape target configuration
└── yace/
    └── config.yml                  # Yet Another CloudWatch Exporter metrics configuration
```
