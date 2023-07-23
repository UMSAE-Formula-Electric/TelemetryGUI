FROM node:14
RUN  apt-get update && apt-get -y install libgtkextra-dev libgconf2-dev libnss3 libasound2 libxtst-dev libxss1
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
CMD ["node", "delete.js"]
# CMD ["yarn", "start"]