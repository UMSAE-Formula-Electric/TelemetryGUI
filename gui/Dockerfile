FROM node:14
# RUN  apt-get update && apt-get -y install libgtkextra-dev libgconf2-dev libnss3 libasound2 libxtst-dev libxss1
RUN apt-get update && apt-get install \
    git libx11-xcb1 libxcb-dri3-0 libxtst6 libnss3 libatk-bridge2.0-0 libgtk-3-0 libxss1 libasound2 libxshmfence1 libglu1 libgbm-dev\
    -yq --no-install-suggests --no-install-recommends \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN chown -R node /usr/src/app

USER node
RUN yarn install

USER root
COPY . .
RUN chown root /usr/src/app/node_modules/electron/dist/chrome-sandbox
RUN chmod 4755 /usr/src/app/node_modules/electron/dist/chrome-sandbox

# CMD ["node", "delete.js"]
# CMD ["yarn", "start"]
USER node
CMD bash