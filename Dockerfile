#docker build -f Dockerfile -t kekonen/binance-notifications:latest .
#docker run --env-file .env -d kekonen/binance-notifications nodemon index.js


FROM node:8-alpine
MAINTAINER daniil

WORKDIR /home/node/binance-notifications

RUN apk add --no-cache curl
RUN apk add --no-cache bash
RUN npm install -g nodemon

COPY . .

RUN chown -Rf node:node .
RUN yarn



# Set the user name or UID to use when running the image and for any RUN, CMD and ENTRYPOINT instructions that follow
USER node

# A container must expose a port if it wants to be registered in Consul by Registrator.
# The port is fed both to node express server and Consul => DRY principle is observed with ENV VAR.
# NOTE: a port can be any, not necessarily different from exposed ports of other containers.

CMD [ "npm", "start" ]
