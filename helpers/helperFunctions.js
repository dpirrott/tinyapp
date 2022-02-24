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

const users = {
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
      if (password !== users[user].password && registered) {
        return { user: null, msg: "Invalid login information", error: true };
      }
      return { user: users[user], msg: "Account already exists!", error: false };
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