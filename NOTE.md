
# Set-up nginx
sudo nano /etc/nginx/sites-available/default
`server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name localhost 127.0.0.1;

    # Correct root for all requests
    root /home/ubuntu/monitoring-stack/nginx/html;
    index index.html;

    # Redirects
    location = /grafana { return 301 /grafana/; }
    location = /prometheus { return 301 /prometheus/; }
    location = /loki { return 301 /loki/ready; }
    location = /node-exporter { return 301 /node-exporter/metrics; }
    location = /cadvisor { return 301 /cadvisor/metrics; }
    location = /yace { return 301 /yace/metrics; }

    # Proxies
    location /grafana/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /prometheus/ {
        proxy_pass http://127.0.0.1:9090;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /node-exporter/ {
        proxy_pass http://127.0.0.1:9100/;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /cadvisor/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /yace/ {
        proxy_pass http://127.0.0.1:5000/;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /loki/ {
        proxy_pass http://127.0.0.1:3100/;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}`

# html permission
sudo chown www-data:www-data /home/ubuntu/monitoring-stack/nginx/html/index.html
sudo chmod 644 /home/ubuntu/monitoring-stack/nginx/html/index.html

# To check existense
ls -l /home/ubuntu/monitoring-stack/nginx/html/index.html

# Make sure the directory is accessible
sudo chmod 755 /home/ubuntu/monitoring-stack/nginx/html

# Make sure the file is readable by nginx (www-data user)
sudo chmod 644 /home/ubuntu/monitoring-stack/nginx/html/index.html

# Set ownership to www-data (nginx worker user)
sudo chown -R www-data:www-data /home/ubuntu/monitoring-stack/nginx/html


# Allow Nginx to traverse the directory
sudo chmod 755 /home/ubuntu
sudo chmod 755 /home/ubuntu/monitoring-stack
sudo chmod 755 /home/ubuntu/monitoring-stack/nginx
sudo chmod 755 /home/ubuntu/monitoring-stack/nginx/html

# Allow Nginx to read the file
sudo chmod 644 /home/ubuntu/monitoring-stack/nginx/html/index.html

# Make sure Nginx owns the directory and file
sudo chown -R www-data:www-data /home/ubuntu/monitoring-stack/nginx/html


# Test & Restart
sudo nginx -t
sudo systemctl restart nginx
