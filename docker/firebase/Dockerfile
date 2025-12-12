FROM eclipse-temurin:11-jre-jammy as base

RUN apt-get update
RUN apt-get install curl -y
RUN apt-get install npm -y
RUN npm cache clean -f
RUN npm install -g n
ARG FIREBASE_TOOLS_VERSION=14.25.0
ENV FIREBASE_TOOLS_VERSION=${FIREBASE_TOOLS_VERSION}
# Pin firebase-tools to a pre-Java-21 release to keep compatibility with Java 11 base image
# This is due to error "Error: firebase-tools no longer supports Java version before 21. Please install a JDK at version 21 or above to get a compatible runtime."
RUN npm install -g firebase-tools@${FIREBASE_TOOLS_VERSION}

FROM base as final

RUN mkdir /app
WORKDIR /app

RUN n 20.12.2
COPY firebase.json .
COPY ./src/test/javascript .
