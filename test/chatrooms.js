const chatrooms = require('../lib/chat_server');
const chai = require('chai');
const assert = chai.assert;
chai.should(); //changes prototypes
const expect = chai.expect;




describe('chatrooms', () => {
    beforeEach(() => {
        chatrooms.clear();
    });
    describe('.saveSync(doc)', () => {
        it('should save the doc', () => {
            const pet = {name: 'Tobi'};
            chatrooms.saveSync(pet);
            const ret = chatrooms.first({name: 'Tobi'});
            assert(ret === pet);
        });
    });
    describe('.first(obj)', () => {
        it('first should return ther first matching doc', () => {
            const pet1 = {name: 'Tobi'};
            const pet2 = {name: 'Pobi'};
            chatrooms.saveSync(pet1);
            chatrooms.saveSync(pet2);
            let ret = chatrooms.first({name: 'Tobi'});
            assert.deepEqual(ret, pet1);
            ret = chatrooms.first({name: 'Pobi'});
            assert.deepEqual(ret,pet2);
        });
        it('first should return null if no matching doc', () => {
            ret = chatrooms.first({name: 'Robi'});
            expect(ret).to.not.equal({name: 'Robi'});
        })
    });

    describe('.save(doc,cb)', () => {
        it('should save the doc', (done) => {
            const doc = {name: 'Tobi'};
            chatrooms.save(doc, () => {
                let ret = chatrooms.first({name: 'Tobi'});
                ret.name.should.equal('Tobi');
                done();
            });
        });
    });
});