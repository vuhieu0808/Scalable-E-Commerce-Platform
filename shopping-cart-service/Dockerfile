FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache wget

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3002

CMD ["npm", "start"]