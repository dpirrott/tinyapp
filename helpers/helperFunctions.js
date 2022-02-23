const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  urlDatabase,
  users,
  userCheck,
  generateRandomString,
  printUsers
};