From ubuntu:trusty
MAINTAINER raulbrito "raulbrito@gmail.com"

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get -y -qq update

# node.js using PPA (for statsd)
RUN apt-get -y -qq install screen
RUN apt-get -y -qq install python-software-properties
RUN apt-get -y -qq install software-properties-common 
RUN apt-add-repository ppa:chris-lea/node.js
RUN apt-get -y -qq update
RUN apt-get -y -qq install pkg-config make g++
RUN apt-get -y -qq install nodejs

# Install git to get statsd
RUN apt-get -y -qq install git

# Supervisor to run everything
RUN apt-get -y -qq install supervisor

# statsd
RUN git clone git://github.com/etsy/statsd.git /opt/statsd
ADD assets/localConfig.js /opt/statsd/localConfig.js

# supervisord
ADD assets/supervisor-statsd.conf /etc/supervisor/conf.d/supervisord.conf

# start script
ADD assets/start-statsd.sh /usr/bin/start-statsd.sh
RUN chmod +x /usr/bin/start-statsd.sh

EXPOSE 5000 8125/udp 2003 2004 7002

CMD ["/usr/bin/start-statsd.sh"]
#CMD sh -c "exec >/dev/tty 2>/dev/tty </dev/tty && /usr/bin/screen -s /bin/bash"
