FROM node:20.9.0-alpine

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN apk add git;

COPY package*.json ./

RUN npm install

EXPOSE 8545

CMD ["npm", "run", "start:dev"]
