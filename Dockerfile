FROM node:18-alpine3.17
RUN addgroup admins && adduser -S -G admins admin
USER admin
WORKDIR /app
COPY . . 
RUN npm install
EXPOSE 1563 1564 1565
CMD npm start