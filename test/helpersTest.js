const { assert } = require('chai');
const bcrypt = require("bcryptjs/dist/bcrypt");

const { getUserByEmail, userCheck, getUserUrls } = require('../helpers/helperFunctions');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

const testDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48ld"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
  i4BoGr: {
    longURL: "https://www.spotify.com",
    userID: "aJ48lW"
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
  it("should return { user: null, msg: expectedMsg, error: true } when either input field is blank and registered flag true", () => {
    const check = userCheck("", "", true, testUsers);
    const expectedMsg = "Both fields must be filled in!";
    const expected = { user: null, msg: expectedMsg, error: true };
    assert.deepEqual(check, expected);
  });
  it("should return { user: null, msg: expectedMsg, error: true } when either input field is blank and registered flag false", () => {
    const check = userCheck("", "", false, testUsers);
    const expectedMsg = "Both fields must be filled in!";
    const expected = { user: null, msg: expectedMsg, error: true };
    assert.deepEqual(check, expected);
  });
  it("should return { user: null, msg: 'Invalid login information', error: true } when account exists and logging in with password incorrect", () => {
    const check = userCheck("user2@example.com", "dishwasher", true, testUsers);
    const expectedMsg = "Invalid login information";
    const expected = { user: null, msg: expectedMsg, error: true };
    assert.deepEqual(check, expected);
  });
  it("should return { user: userExists, msg: null, error: false } when account exists and logging in with correct password", () => {
    const check = userCheck("user2@example.com", "dishwasher-funk", true, testUsers);
    const userExists = getUserByEmail("user2@example.com", testUsers);
    const expected = { user: userExists, msg: null, error: false };
    assert.deepEqual(check, expected);
  });
  it("should return { user: null, msg: 'Account already exists!', error: true } when account exists while trying to register", () => {
    const check = userCheck("user2@example.com", "dishwasher-funk", false, testUsers);
    const user = null;
    const expectedMsg = "Account already exists!";
    const expected = { user: user, msg: expectedMsg, error: true };
    assert.deepEqual(check, expected);
  });
  it("should return { user: null, msg: 'Invalid account information', error: false } when no user is found while logging in", () => {
    const check = userCheck("user1@example.com", "dishwasher-funk", true, testUsers);
    const user = null;
    const expectedMsg = "Invalid account information";
    const expected = { user: user, msg: expectedMsg, error: false };
    assert.deepEqual(check, expected);
  });
  it("should return { user: null, msg: 'Invalid account information', error: false } when no user is found while registering", () => {
    const check = userCheck("user1@example.com", "dishwasher-funk", false, testUsers);
    const user = null;
    const expectedMsg = "Invalid account information";
    const expected = { user: user, msg: expectedMsg, error: false };
    assert.deepEqual(check, expected);
  });


});

describe('getUserUrls', () => {
  it("should only return url objects that the user created", () => {
    const userObjects = getUserUrls("aJ48lW", testDatabase);
    const expected = {
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
      },
      i4BoGr: {
        longURL: "https://www.spotify.com",
        userID: "aJ48lW"
      }
    }
    assert.deepEqual(userObjects, expected);
  });
  it("should return empty object if user has no urls", () => {
    const userObjects = getUserUrls("aJ45lW", testDatabase);
    const expected = {};
    assert.deepEqual(userObjects, expected);
  });
});