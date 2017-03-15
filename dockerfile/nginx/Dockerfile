FROM nginx:latest
RUN cp -a /etc/nginx /etc/nginx_backup
ADD entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh