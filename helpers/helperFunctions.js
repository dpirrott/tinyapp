const bcrypt = require("bcryptjs/dist/bcrypt");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {};

// Gather only URLs that are unique to the user, return customized user database
const getUserUrls = function(userID) {
  const userURLs = {};
  for (const urlObj in urlDatabase) {
    if (urlDatabase[urlObj].userID === userID) {
      userURLs[urlObj] = urlDatabase[urlObj];
    }
  }
  return userURLs;
};

const getUserByEmail = function(email, database) {
  for (const userID in database) {
    if (database[userID].email === email) {
      return database[userID];
    }
  }
  return null;
}

const userCheck = function(email, password, registered) {
  if (email === "" || password === "") {
    return { user: null, msg: "Both fields must be filled in!", error: true };
  }
  // Return users database profile if exists, otherwise null
  const userExists = getUserByEmail(email, users);
  // Go through verification process
  if (userExists && registered) {
    // Account found, check password
    if (!bcrypt.compareSync(password, userExists.password)) {
      return { user: null, msg: "Invalid login information", error: true };
    }
    // Correct password, return user with no error
    return { user: userExists, msg: null, error: false };
  } else if (userExists && !registered) {
    // Account found while looking to register, return error and msg
    return { user: null, msg: "Account already exists!", error: true };
  }
  // No account found, success for registration (error msg ignored), failure for login
  return { user: null, msg: "Invalid account information", error: false };
};

const generateRandomString = function() {
  let randomString = "";
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 6; i++) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }
  return randomString;
};

const printUsers = function() {
  console.log("Printing Users Object:")
  for (const user in users) {
    const id = users[user].id;
    const email = users[user].email;
    const password = users[user].password;
    console.log(`id: ${id} --- email: ${email} --- password: ${password}`);
  }
}

module.exports = {
  generateRandomString,
  getUserUrls,
  getUserByEmail,
  printUsers,
  urlDatabase,
  users,
  userCheck
};