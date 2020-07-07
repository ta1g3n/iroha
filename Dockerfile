FROM centos:8
ADD ./files /
ADD ./ /var/www/
RUN dnf install -y epel-release
RUN dnf install -y nodejs npm mongodb-org supervisor.noarch
RUN mkdir -p /data/db
#RUN cd /var/www/client; npm install
#RUN cd /var/www/server; npm install
VOLUME /data/db
EXPOSE 80
CMD supervisord -c /etc/supervisord.conf
