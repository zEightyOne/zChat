[logo]:https://github.com/zEightyOne/chatrooms/blob/master/public/img/logo.jpg

![Live Chat][logo]
# zChat 
__________

Chatroom module developed using sockets.io and node.js

There are two branches one using JQuery and one using Vue.js
The Vue.js branch will eventually be merged into master branch and the JQuery branch will not be maintained.

This will be implemented into larger communication application

To run, make sure you have installed Node.js I used the Current but I'm sure LTS works fine

From the project root directory:

To run the service:

`npm install`

`node index.js `

### Unit and Acceptance Tests
__________

With the service running you have the option of running unit tests and acceptance tests.
The unit tests are written in mocha/chai

`npm test`

To run the acceptance test you must have a [selenium standalone](https://www.seleniumhq.org/download/) server running

`java -jar selenium-server-standalone-3.10.0.jar`

I've only tested against firefox and in order to do so you need to make sure you have the [marionette driver](https://github.com/mozilla/geckodriver/releases) in your path


Once done run:

`npm run accept`

Have fun (send any feedback to cooper.canada@me.com :)


