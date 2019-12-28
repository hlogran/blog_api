FROM node:10.15-slim

RUN npm install -g nodemon

WORKDIR /node

COPY package*.json ./

RUN npm install && npm cache clean --force

EXPOSE 3000:3000

WORKDIR /node/app

COPY . .

CMD nodemon -L /node/app/src/index.js