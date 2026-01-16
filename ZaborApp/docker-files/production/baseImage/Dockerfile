FROM node:20.19.5-alpine AS node
FROM nginx:1.28.0-alpine

RUN cat /etc/alpine-release
RUN cat /etc/os-release
RUN echo "active processors = `nproc`"

COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

LABEL Maintainer="Umar Ali Khan <uak282006@gmail.com>" \
    Description="Angular frontend image on top of Alpine Linux."

ARG NODE_VERSION="20.19.5"

# Metadata
LABEL org.opencontainers.image.vendor="Umar Ali Khan" \
    org.opencontainers.image.url="https://github.com/UAK-35/alpine-node" \
    org.opencontainers.image.title="Angular frontend on Alpine" \
    org.opencontainers.image.description="Angular frontend image on top of Alpine Linux." \
    org.opencontainers.image.version="$NODE_VERSION" \
    org.opencontainers.image.documentation="https://github.com/UAK-35/alpine-node"

# Instalar paquetes necesarios
RUN apk update && apk upgrade && apk add --no-cache redis coreutils util-linux gawk bind-tools findutils
RUN apk add --no-cache bash curl git openssh openssl rsync tar nano zstd && true
RUN apk add --no-cache linux-headers musl-dev make autoconf pkgconfig gcc g++ && true
RUN apk add --no-cache age sops certbot certbot-nginx && true

# Crear usuario no privilegiado
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

# Configurar nginx para puerto no privilegiado
RUN sed -i 's/listen\s*80;/listen 8080;/g' /etc/nginx/conf.d/default.conf && \
    sed -i 's/listen\s*\[::\]:80;/listen [::]:8080;/g' /etc/nginx/conf.d/default.conf

# Dar permisos a directorios necesarios
RUN chown -R appuser:appuser /var/cache/nginx && \
    chown -R appuser:appuser /var/log/nginx && \
    chown -R appuser:appuser /etc/nginx && \
    chown -R appuser:appuser /usr/share/nginx/html && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appuser /var/run/nginx.pid

# Cambiar a usuario no privilegiado
USER appuser

EXPOSE 8080

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
