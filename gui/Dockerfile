FROM node:14.17.5
RUN apt-get update
RUN  apt-get -y install libgtkextra-dev libgconf2-dev libnss3 libasound2 libxtst-dev libxss
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
CMD ["yarn", "start"]