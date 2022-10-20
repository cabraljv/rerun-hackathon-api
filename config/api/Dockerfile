FROM node:14-alpine

WORKDIR /app
RUN chown -R node /app
USER node

COPY package*.json .

RUN npm install

COPY . .

EXPOSE $PORT

CMD [ "yarn", "serve" ]