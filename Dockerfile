FROM node:8.9.1-alpine

RUN apk add --update git
RUN apk add --update openssh

# !!! ATTENTION !!! hyper-api uses a package called hyper-error. hyper-error is provided as a private github repository for that reason
# this dockerfile requires a private key to be present at the project root directory so that npm install can clone the private repo.
# A better solution for this problem is needed.
RUN mkdir -p /root/.ssh/
ADD ./id_rsa /root/.ssh/id_rsa

RUN ssh-keyscan -t rsa github.com 2>&1 >> /root/.ssh/known_hosts

WORKDIR /hyper

COPY config/ config/
COPY lib/ lib/
COPY util/ util/
COPY index.js package.json ./

RUN npm install

# Remove users private key
RUN rm -rf /root/.ssh/id_rsa

EXPOSE 3000

CMD npm start
