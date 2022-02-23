const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}), cookieParser());

app.set("view engine", "ejs");

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

const generateRandomString = function() {
  let randomString = "";
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 6; i++) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }
  return randomString;
};

const idFromEmailLookup = function(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
  return undefined;
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

// Considering the home directory incomplete, for now redirect to URL summary page
app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.get("/register", (req,res) => {
  const templateVars = { user: users[req.cookies.user_id], msg: undefined };
  res.render("register_user", templateVars);
});

app.post("/register", (req,res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const emailExists = idFromEmailLookup(email);

  if (email === "" || password === "") {
    const msg = "Both form fields must be filled in!";
    const templateVars = { user: users[req.cookies.user_id], msg: msg };
    res.statusCode = 400;
    res.render("register_user", templateVars);
  }else if(emailExists) {
    const msg = "Email already exists!";
    const templateVars = { user: users[req.cookies.user_id], msg: msg };
    res.statusCode = 400;
    res.render("register_user", templateVars);
  } else {
    const newUser = {
      id: userId,
      email: email,
      password: password
    };
    users[userId] = newUser;
    res.cookie("user_id", userId);
    res.redirect("/urls");
  }
});

app.get("/login", (req,res) => {
  const msg = undefined;
  const templateVars = { user: users[req.cookies.user_id], msg: msg }
  res.render("login", templateVars);
});

app.post("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = idFromEmailLookup(email);
  if (email === "" || password === "") {
    const msg = "Please fill in both fields!";
    const templateVars = { user: users[req.cookies.user_id], msg: msg };
    res.statusCode = 403;
    res.render("login", templateVars);
  } else if (!userId) {
    const msg = "Invalid login information";
    const templateVars = { user: users[req.cookies.user_id], msg: msg };
    res.statusCode = 403;
    res.render("login", templateVars);
  } else if(password !== users[userId].password) {
    const msg = "Invalid login information";
    const templateVars = { user: users[req.cookies.user_id], msg: msg };
    res.statusCode = 403;
    res.render("login", templateVars);
  } else {
    res.cookie("user_id", userId);
    res.redirect('/urls');
  }
});

app.post("/logout", (req,res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// Display users URL's summary
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  res.render('urls_index', templateVars);
});

// New URL submitted via form
app.post("/urls", (req,res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/u/${shortURL}`);
});

// Generate form for user to submit new URL
app.get("/urls/new", (req,res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render('urls_new', templateVars);
});

app.post("/urls/:shortURL/delete", (req,res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// Redirects to edit link page
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!(shortURL in urlDatabase)) {
    res.redirect('/*');
  } else {
    const longURL = urlDatabase[shortURL];
    const templateVars = {
      shortURL: shortURL,
      longURL: longURL,
      user: users[req.cookies.user_id]
    };
    res.render('urls_show', templateVars);
  }
});

// Update longURL corresponding to id => (shortURL)
app.post("/urls/:id", (req,res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.newLongURL;
  res.redirect('/urls');
});

// Handle all invalid path requests
app.get("/*", (req,res) => {
  res.statusCode = 404;
  res.write("<h1>404 Page Not Found</h1>");
  res.end();
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});