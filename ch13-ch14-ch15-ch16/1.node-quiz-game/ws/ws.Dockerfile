# base Node.js image
FROM node:16-alpine

# environment variables
ENV NODE_ENV=production
ENV NODE_WSPORT=8001
ENV HOME=/home/node/app
ENV PATH=${PATH}:${HOME}/node_modules/.bin

# create application folder and assign rights to the node user
RUN mkdir -p $HOME && chown -R node:node $HOME

# set the working directory
WORKDIR $HOME

# copy package.json from the host
COPY --chown=node:node package*.json $HOME/

# set the active user
USER node

# install application modules
RUN npm install

# copy remaining files
COPY --chown=node:node . .

# expose port on the host
EXPOSE $NODE_WSPORT

# application launch command
CMD [ "node", "./index.js" ]