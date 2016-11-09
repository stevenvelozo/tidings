FROM ubuntu:trusty
MAINTAINER Steven Velozo <steven@velozo.com>

# Prepare APT
ENV DEBIAN_FRONTEND noninteractive
# Install node.js
RUN apt-get update && apt-get install -y curl git
RUN curl --silent --location https://deb.nodesource.com/setup_6.x | sudo bash -
RUN apt-get install --yes nodejs

ADD . /tidings
WORKDIR /tidings
RUN npm install
RUN ./InitializeOptionalUbuntuSoftware.sh
RUN ./InitializeOptionalModules.sh
RUN mkdir stage

# Clean APT
RUN rm -rf /var/lib/apt/lists/*

#Web server port
EXPOSE 8080

CMD ["node", "examples/Debug.js"]
