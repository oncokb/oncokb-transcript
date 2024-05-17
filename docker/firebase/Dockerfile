FROM ibmjava:8-jre

RUN mkdir /app
WORKDIR /app

COPY firebase.json .

RUN apt-get update

RUN apt-get install npm -y
RUN npm cache clean -f
RUN npm install -g n
RUN n 20.12.2
RUN npm install -g firebase-tools

# RUN firebase emulators:start --import src/test/javascript/firebase --project oncokb-curation-test-54b6c