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

const getUserUrls = function(userID) {
  const userURLs = {};
  for (const urlObj in urlDatabase) {
    if (urlDatabase[urlObj].userID === userID) {
      userURLs[urlObj] = urlDatabase[urlObj];
    }
  }
  return userURLs;
};

const userCheck = function(email, password, registered) {
  if (email === "" || password === "") {
    return { user: null, msg: "Both fields must be filled in!", error: true };
  }
  
  for (const user in users) {
    if (users[user].email === email) {
      if (!registered) {
        return { user: null, msg: "Account already exists!", error: true };
      }
      if (registered && !bcrypt.compareSync(password, users[user].password)) {
        return { user: null, msg: "Invalid login information", error: true };
      }
      return { user: users[user], msg: null, error: false };
    }
  }

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
  printUsers,
  urlDatabase,
  users,
  userCheck
};