FROM node:alpine3.20
WORKDIR /app
COPY package*.json ./
RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake
RUN npm install --omit dev
COPY dist/* /app
VOLUME ["/app/questions"]
CMD ["node", "dist/index.js"]
