FROM node:10.9.0-alpine

WORKDIR /app
ADD . /app

RUN yarn install

EXPOSE 8080

CMD ["yarn", "run", "slack"]
