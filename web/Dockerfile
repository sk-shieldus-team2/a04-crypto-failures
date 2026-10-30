# nginx on Ubuntu 22.04 (EC2 Ubuntu에 apt로 설치하는 것과 같은 방식)
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
 && apt-get install -y --no-install-recommends nginx \
 && rm -rf /var/lib/apt/lists/* \
 && rm -f /etc/nginx/sites-enabled/default \
 && ln -sf /dev/stdout /var/log/nginx/access.log \
 && ln -sf /dev/stderr /var/log/nginx/error.log

COPY vuln/team2.conf /etc/nginx/sites-enabled/team2.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
