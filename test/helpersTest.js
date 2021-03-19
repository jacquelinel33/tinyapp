
const { assert } = require('chai');

const { findIdByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findIdByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findIdByEmail("user@example.com", testUsers);
    const expectedOutput = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(expectedOutput, user);
  });
});


describe('findIdByEmail', function() {
  it('should return undefined if email does not exist', function() {
    const user = findIdByEmail("doesnotexist@gmail.com", testUsers);
    const expectedOutput = false;
    assert.deepEqual(expectedOutput, user);
  });
});