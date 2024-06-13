FROM node:20.12.2 as base

RUN apt-get update

RUN apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev libnss3 -y


FROM base as node_modules

RUN mkdir /app
WORKDIR /app

COPY package*.json .
COPY yarn.lock .

RUN yarn install


FROM node_modules as final

WORKDIR /app
COPY . .
RUN yarn run webapp:build:dev
