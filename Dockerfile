FROM node:18

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm install

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "deploy"]