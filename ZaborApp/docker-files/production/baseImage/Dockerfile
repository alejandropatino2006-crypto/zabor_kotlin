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
    Description="Angular frontend iamge on top of Alpine Linux."

ARG NODE_VERSION="20.19.5"

# Metadata
LABEL org.opencontainers.image.vendor="Umar Ali Khan" \
    org.opencontainers.image.url="https://github.com/UAK-35/alpine-node" \
    org.opencontainers.image.title="Angular frontend on Alpine" \
    org.opencontainers.image.description="Angular frontend image on top of Alpine Linux." \
    org.opencontainers.image.version="$NODE_VERSION" \
    org.opencontainers.image.documentation="https://github.com/UAK-35/alpine-node"

RUN apk update && apk upgrade && apk add --no-cache redis coreutils util-linux gawk bind-tools findutils
RUN apk add --no-cache bash curl git openssh openssl rsync tar nano zstd && true
RUN apk add --no-cache linux-headers musl-dev make autoconf pkgconfig gcc g++ && true
RUN apk add --no-cache age sops certbot certbot-nginx && true
