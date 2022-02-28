const bcrypt = require("bcryptjs/dist/bcrypt");

const uniqueVisits = function(visits) {
  const uniqueVisitors = {};
  const uniqueLogs = visits.filter(visit => {
    if (uniqueVisitors[visit.userID]) {
      return false;
    }
    uniqueVisitors[visit.userID] = visit.userID;
    return true;
  });
  return uniqueLogs.length;
};

const visitCount = function(visits) {
  return visits.length;
}

// Gather only URLs that are unique to the user, return customized user url database
const getUserUrls = function(userID, database) {
  const userURLs = {};
  for (const urlObj in database) {
    if (database[urlObj].userID === userID) {
      userURLs[urlObj] = database[urlObj];
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
};

// userCheck handles error checking for both POST /login and /register.
// The 'registered' parameter is a boolean refering to whether someone
// is signing in (true), or registering as a new user (false).
const userCheck = function(email, password, registered, database) {
  if (email === "" || password === "") {
    return { user: null, msg: "Both fields must be filled in!", error: true };
  }
  // Return users database profile if exists, otherwise null
  const userExists = getUserByEmail(email, database);
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

// Generates random string of specified length (for modularity)
const generateRandomString = function(length) {
  let randomString = "";
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < length; i++) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }
  return randomString;
};

module.exports = {
  generateRandomString,
  getUserUrls,
  getUserByEmail,
  userCheck,
  visitCount,
  uniqueVisits
};