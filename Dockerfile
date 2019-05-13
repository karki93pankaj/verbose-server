FROM node:10.15.1-alpine
WORKDIR "/app"
COPY ./package.json ./
RUN yarn install
COPY . .
EXPOSE 4400
CMD ["yarn", "start"]
