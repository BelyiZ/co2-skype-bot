FROM node:7.2.1

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY app.js /usr/src/app

#EXPOSE 3978
CMD [ "node", "app.js" ]