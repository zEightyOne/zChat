FROM node:carbon

ENV PORT 8080

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . . 

EXPOSE ${PORT}

CMD ["npm", "start"]

## Do the following for a simple docker example
##
## Build the image
## ===============
##
## $ docker build -t <your username>/chatrooms .
##
## That creates the image, you can check with
##
## $ docker images
##
## Run the image
## =============
## redirect the port to an ephemeral port 
## 
## $ docker run -p 49160:8080 -d <your username>/chatroom
##
## Random commands
## ===============
##
## docker ps -> gets container ID
## docker logs <container ID> -> Prints the app output
## docker exec -it <container ID> /bin/bash -> Enter the container
##
## Test
## ====
## curl -i localhost:49160
##