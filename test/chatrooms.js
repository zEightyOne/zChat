const chatrooms = require('../lib/chat_server');
const io = require('socket.io-client');
const chai = require('chai');
const assert = chai.assert;
chai.should(); //changes prototypes
const expect = chai.expect;
let socket;

describe('chatrooms', () => {
    before(() => socket = io.connect('http://localhost:3000'));
    describe('Name validation', () => {
        it('assignGuestName', () => {
            let number = 1000;
            let result = chatrooms.assignGuestName(socket,number,[],[]);

            result.should.equal(number+1);
        });
    });
    describe('TODO', () => {
        it('TODO', () => {
        });
    });
    after( () => socket.disconnect());
});