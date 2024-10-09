FROM node:18.16-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .

RUN apk add -U tzdata

ENV TZ=Asia/Kolkata

RUN cp /usr/share/zoneinfo/Asia/Kolkata /etc/localtime

RUN  npm install
 
RUN  yarn build

FROM node:18.16-alpine

COPY --from=build /usr/src/app/node_modules ./node_modules

COPY --from=build /usr/src/app/package.json ./.

COPY --from=build /usr/src/app/tsconfig.json ./tsconfig.json

COPY --from=build /usr/src/app/dist ./dist

CMD [ "yarn", "start" ]
