FROM node:20.12.2

RUN mkdir /app
WORKDIR /app

COPY . .

RUN apt-get update

RUN apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev libnss3 -y

RUN yarn install