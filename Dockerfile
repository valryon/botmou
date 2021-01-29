FROM node:10.16-alpine

WORKDIR /app
ADD . /app

RUN yarn install

EXPOSE 8080

CMD ["yarn", "run", "telegram"]
