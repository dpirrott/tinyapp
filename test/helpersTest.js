const { assert } = require('chai');

const { getUserByEmail, userCheck } = require('../helpers/helperFunctions');

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

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
      const user = getUserByEmail("user@example.com", testUsers);
      const expectedUserID = "userRandomID";
      // Write your assert statement here
      assert.strictEqual(user.id, expectedUserID);
    });
  it('should return null if email doesn\'t exist', () => {
      const user = getUserByEmail("user1@example.com", testUsers);
      const expectedUserID = null;
      // Write your assert statement here
      assert.strictEqual(user, expectedUserID);
    });
});

describe('userCheck', () => {
    it("should return user as null, a populated msg, and error flag true when either input field is blank and registered flag true", () => {
      const check = userCheck("", "", true);
      const expectedMsg = "Both fields must be filled in!";
      const expected = { user: null, msg: expectedMsg, error: true };
      assert.deepEqual(check, expected);
    });
  })