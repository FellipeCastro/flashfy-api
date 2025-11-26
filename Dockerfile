FROM node:18

WORKDIR /api

COPY . .

RUN rm -rf node_modules
RUN npm install --omit=dev

CMD ["npm", "start"]

EXPOSE 5000
