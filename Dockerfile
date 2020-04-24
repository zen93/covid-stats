FROM node:12

ARG PORT=8080
ENV PORT=${PORT}

RUN mkdir /home/node/app/ && chown -R node:node /home/node/app

COPY wordpress-cloud-run-owner-key.json /home/node/app/keys/wordpress-cloud-run-owner-key.json

WORKDIR /home/node/app

COPY --chown=node:node package*.json ./

USER node

RUN npm install --only=production && npm cache clean --force --loglevel=error

COPY --chown=node:node . ./

CMD [ "node", "./bin/www"]