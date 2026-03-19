FROM node:18-alpine

# Install additional SSL certificates
RUN apk add --no-cache ca-certificates

WORKDIR /app

COPY frontend/ .

# Set NODE_OPTIONS to handle SSL
ENV NODE_OPTIONS="--use-openssl-ca"

RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
