FROM node:24.6.0
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install
COPY . .
CMD [ "node", "main.js" ]
