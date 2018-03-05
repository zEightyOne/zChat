'use strict';
const chai = require('chai');
const assert = chai.assert;
const webdriverio = require('webdriverio');
chai.should();

//
// To run selenium tests on Firefox you need to do the following:
//
// 1) Make sure you have the latest Firefox driver somewhere in your path https://github.com/mozilla/geckodriver/releases this was tested with (0.19.1)
// 2) Download the standalone Selinium server https://github.com/mozilla/geckodriver/releases (this is tested with 3.10.0)
// 3) Run Selenium:         java -jar selenium-server-standalone-3.10.0.jar &
// 4) Run Chat Server:      node index.js
// 5) Run Acceptance Tests: node run accept 
//

describe('acceptance: ', () => {
  let browserOne, browserTwo;
  let username = 'Sri';
  let randomMessage;
  let url = 'http://localhost:3000';
  const randomSentenceURL = 'http://watchout4snakes.com/wo4snakes/Random/RandomSentence';

  before((done) => {

    webdriverio.remote()
        .init(done)
        .url(randomSentenceURL)
        .getHTML('#result',false).then(result => randomMessage = result.toString())
        .end(done);

    browserOne = webdriverio.remote();
    browserTwo = webdriverio.remote();
    browserTwo.init(done);
    return browserOne.init(done);
  });
  describe('username validation: ', () => {
      it('set/check username...', () => {
          return browserOne
              .url(url)
              .alertText(username)
              .alertAccept()
              .then(setTimeout(() => console.log('One Mississpi.. Two Mississipi..'),500))
              .getHTML('#room', false)
              .then(room => room.should.equal(`Hello ${username}, you are currently in Lobby`));
      });
      it('check duplicate handling', () => {
          return browserTwo
              .url(url)
              .alertText(username)
              .alertAccept()
              .then(setTimeout(() => console.log('One Mississpi.. Two Mississipi..'),500))
              .getHTML('#room', false)
              .then(room => room.should.not.equal(`Hello ${username}, you are currently in Lobby`));
      });
  });
  describe('message send and receive:', () => {
      it('send random message...',() => {
          return browserOne
              .url(url)
              .waitForExist('#send-message',500)
              .setValue('#send-message',randomMessage)
              .click('#send-button');
      });
      it('check if message recieved...',() => {
          return browserTwo
              .url(url)
              .waitForText('.friend-message .main-text',3000)
              .getText(`.main-text*=${randomMessage}`)
              .then(message => console.log(message));
      });
  });
  after((done) => {
      browserOne.end(done);
      browserTwo.end(done);
  });
});
