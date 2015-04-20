FROM ubuntu:trusty

RUN apt-get update; \
    apt-get install -y nginx; \
    apt-get install -y git; \
    apt-get install -y nodejs npm nodejs-legacy; \
    apt-get clean
ADD . /app
WORKDIR /app
RUN npm install
RUN node_modules/.bin/bower install --allow-root
RUN node_modules/.bin/gulp
RUN sed -i 's|root.*|root /app/dist;|' /etc/nginx/sites-enabled/*
RUN echo "daemon off;" >> /etc/nginx/nginx.conf
ENTRYPOINT /usr/sbin/nginx
EXPOSE 80
