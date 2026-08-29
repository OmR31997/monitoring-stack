# 📊 Production-Ready Monitoring & Observability Stack

A flexible, full-featured monitoring and observability stack powered by **Docker Compose**, integrating metrics collection, log aggregation, cloud metrics exporting, and a unified **Nginx Gateway**.

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

| Service | Container Name | Description | Default Internal Port |
| :--- | :--- | :--- | :--- |
| **Nginx Gateway** | `nginx-gateway` | Reverse proxy routing all subpaths through port 80 and hosting the landing page. | `80` |
| **Grafana** | `grafana` | Visualization platform provisioned with Prometheus and Loki datasources. | `3000` |
| **Prometheus** | `prometheus` | Time-series metrics engine scraping Node Exporter, cAdvisor, YACE, and receiving remote-writes. | `9090` |
| **Loki** | `loki` | High-efficiency log aggregation system storing logs collected from Docker containers. | `3100` |
| **Grafana Alloy** | `alloy` | Next-generation telemetry collector forwarding container logs to Loki and metrics to Prometheus. | — |
| **Node Exporter** | `node-exporter` | Collects host system metrics (CPU, RAM, Disk, Network, OS parameters). | `9100` |
| **cAdvisor** | `cadvisor` | Analyzes resource usage and performance characteristics of running Docker containers. | `8080` |
| **YACE** | `yace` | Yet Another CloudWatch Exporter querying AWS CloudWatch metrics (e.g., EC2 stats). | `5000` |
| **Alpine** | `alpine` | Lightweight utility container kept active for network testing and in-cluster debugging. | — |

---

## 🌐 Unified Access URLs (Port 80)

With the **Nginx Gateway**, all services are accessible via a single HTTP port (`80` by default) using clean path prefixes:

| Endpoint / Service | URL Pattern (Local / Production) | Description |
| :--- | :--- | :--- |
| **Gateway Landing Page** | `http://localhost/` or `http://<your-domain>/` | Central navigation portal linking to all services. |
| **Grafana Dashboard** | `http://localhost/grafana/` or `http://<your-domain>/grafana/` | Web interface for viewing dashboards and exploring metrics/logs. |
| **Prometheus UI** | `http://localhost/prometheus/` or `http://<your-domain>/prometheus/` | Prometheus status page and PromQL query console. |
| **Node Exporter Metrics** | `http://localhost/node-exporter/metrics` | Raw Prometheus metrics for host system performance. |
| **cAdvisor Metrics** | `http://localhost/cadvisor/metrics` | Raw Prometheus metrics for Docker container statistics. |
| **YACE Metrics** | `http://localhost/yace/metrics` | Raw Prometheus metrics fetched from AWS CloudWatch. |
| **Loki Readiness Check** | `http://localhost/loki/ready` | Health check endpoint returning `ready` when Loki is active. |

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
| `BIND_IP` | `0.0.0.0` | Host IP binding. Use `0.0.0.0` for external network access or `127.0.0.1` for strict local access. |
| `SERVER_NAME` | `localhost` | Hostname or IP address used by Nginx (`server_name`) and Grafana root URL routing. |
| `NGINX_PORT` | `80` | External port exposed by Nginx Gateway. |
| `GRAFANA_ADMIN_USER` | `admin` | Default admin username for Grafana login. |
| `GRAFANA_ADMIN_PASSWORD` | `Admin@123` | Default admin password for Grafana login. |
| `AWS_REGION` | `ap-south-1` | Target AWS region for YACE CloudWatch metric queries. |
| `AWS_ACCESS_KEY_ID` | *(Optional)* | AWS access key for YACE CloudWatch authentication. |
| `AWS_SECRET_ACCESS_KEY` | *(Optional)* | AWS secret key for YACE CloudWatch authentication. |
| `PROMETHEUS_PORT` | `9090` | Host port mapping for direct Prometheus access. |
| `GRAFANA_PORT` | `3000` | Host port mapping for direct Grafana access. |
| `LOKI_PORT` | `3100` | Host port mapping for direct Loki access. |
| `YACE_PORT` | `5000` | Host port mapping for direct YACE access. |
| `NODE_EXPORTER_PORT` | `9100` | Host port mapping for direct Node Exporter access. |
| `CADVISOR_PORT` | `8080` | Host port mapping for direct cAdvisor access. |

### 3. Environment Profiles

#### Local Development (`localhost`):
```env
BIND_IP=0.0.0.0
SERVER_NAME=localhost
NGINX_PORT=80
```

#### Production Deployment (`monitoring.yourdomain.com`):
```env
BIND_IP=0.0.0.0
SERVER_NAME=monitoring.yourdomain.com
NGINX_PORT=80
```

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
   Open [`http://localhost/`](http://localhost/) (or your configured server domain) in your browser.

---

## 🛠️ Management & Troubleshooting

### Viewing Service Logs
```bash
# View logs for all services
docker compose logs -f

# View logs for a specific service (e.g., nginx, alloy, prometheus)
docker compose logs -f nginx-gateway
docker compose logs -f alloy
```

### Stopping & Cleaning Up
```bash
# Stop all services
docker compose stop

# Tear down containers and networks
docker compose down

# Remove containers, networks, and persistent data volumes
docker compose down -v
```

---

## 📁 Directory Structure

```
.
├── docker-compose.yml              # Main container orchestration file
├── .env.example                    # Template for environment variables
├── alloy/
│   └── config.alloy                # Grafana Alloy collection pipeline config
├── grafana/
│   ├── dashboards/                 # Pre-configured Grafana dashboards
│   └── provisioning/
│       ├── dashboards/dashboards.yml
│       └── datasources/datasources.yml # Automatic Prometheus & Loki datasource provisioning
├── loki/
│   └── config.yml                  # Loki storage and schema configuration
├── nginx/
│   └── templates/
│       └── default.conf.template   # Nginx Gateway reverse proxy configuration
├── prometheus/
│   └── prometheus.yml              # Prometheus scrape targets configuration
└── yace/
    └── config.yml                  # Yet Another CloudWatch Exporter metrics configuration
```
