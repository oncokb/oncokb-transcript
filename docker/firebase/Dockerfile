FROM sapmachine:11-jre-headless-ubuntu

RUN mkdir /app
WORKDIR /app

COPY firebase.json .
COPY ./src/test/javascript .

RUN apt-get update

RUN apt-get install curl -y

RUN apt-get install npm -y
RUN npm cache clean -f
RUN npm install -g n
RUN n 20.12.2
RUN npm install -g firebase-tools