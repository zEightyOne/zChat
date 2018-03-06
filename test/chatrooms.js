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
        it('changeName', () => {
            socket.emit('nameAttempt', 'Sri');
            setTimeout(() => {
            chatrooms.nickNames[socket.id].should.equal('Sri');
            },500);
        });
    });
    describe('Rooms', () => {
        it('joinRoom', () => {
            socket.emit('join','QA Lab');
            setTimeout(() => {
                chatrooms.currentRoom[socket.id].should.equal('QA Lab');
            },500);
        });
    });
    after( () => {
        socket.disconnect();
    });
});