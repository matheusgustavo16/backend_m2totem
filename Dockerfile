FROM node
RUN mkdir -p /usr/app/node_modules && chown -R node:node /usr/app/

WORKDIR /usr/app

COPY package*.json ./
RUN yarn
RUN yarn add sharp rembg-node

COPY --chown=node:node . .

EXPOSE 1337

CMD ["yarn", "dev"]