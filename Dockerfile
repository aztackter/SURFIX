FROM node:18-alpine

WORKDIR /app

COPY api/package*.json ./
RUN npm install --production

COPY api/ .

EXPOSE 3001

CMD ["npm", "start"]
