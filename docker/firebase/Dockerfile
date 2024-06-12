FROM sapmachine:11-jre-headless-ubuntu as base

RUN apt-get update
RUN apt-get install curl -y
RUN apt-get install npm -y
RUN npm cache clean -f
RUN npm install -g n
RUN npm install -g firebase-tools

FROM base as final

RUN mkdir /app
WORKDIR /app

RUN n 20.12.2
COPY firebase.json .
COPY ./src/test/javascript .
