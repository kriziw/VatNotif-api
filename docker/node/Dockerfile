FROM arm64v8/node:18.16.0-alpine

RUN mkdir /myapp
WORKDIR /myapp
COPY . /myapp
RUN yarn global add typescript
RUN npm install

COPY docker/node/entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]

CMD ["npm", "run", "dev"]
