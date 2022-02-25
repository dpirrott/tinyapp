const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');
const { 
  urlDatabase, 
  users, 
  userCheck, 
  printUsers,
  generateRandomString,
  getUserUrls
} = require('./helpers/helperFunctions');

app.use(bodyParser.urlencoded({extended: true}), cookieSession({
  name: 'session',
  keys: ['user_id']
}));

app.set("view engine", "ejs");

// Considering the home directory incomplete, for now redirect to URL summary page
app.get("/", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect("/login");
  }
  return res.redirect('/urls');
});

app.get("/register", (req,res) => {
  const templateVars = { user: users[req.session.user_id], msg: undefined };
  res.render("register_user", templateVars);
});

app.post("/register", (req,res) => {
  const userId = generateRandomString();
  const { email, password } = req.body;
  const hashedPassword = password === "" ? "" : bcrypt.hashSync(password, 10);
  const { user, msg, error } = userCheck(email, hashedPassword, false, users);

  if (error) {
    const templateVars = { user, msg };
    res.statusCode = 400;
    res.statusMessage = msg;
    return res.render("register_user", templateVars);
  } else {
    const newUser = {
      id: userId,
      email: email,
      password: hashedPassword
    };
    users[userId] = newUser;
    req.session.user_id = userId;
    return res.redirect("/urls");
  }
});

app.get("/login", (req,res) => {
  const templateVars = { user: null, msg: null };
  res.render("login", templateVars);
});

app.post("/login", (req,res) => {
  const { email, password} = req.body;
  const { user, msg, error } = userCheck(email, password, true, users);

  if (error || !user) {
    const templateVars = { user: user, msg: msg };
    res.statusCode = 403;
    res.statusMessage = msg;
    res.render("login", templateVars);
  } else {
    req.session.user_id = user.id;
    res.redirect('/urls');
  }
});

app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect("/login");
});

// Display users URL's summary
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.statusCode = 403;
    res.statusMessage = "Need to login to view your URL's";
    return res.render("login", { user: null, msg: "You need to login to view your URL's" });
  }
  const templateVars = {
    urls: getUserUrls(userID, urlDatabase),
    user: users[userID]
  };
  res.render('urls_index', templateVars);
});

// New URL submitted via form
app.post("/urls", (req,res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(403).send("You must be logged in to create tinyURLs. <a href='/login'>Login Page</a>\n");
  }
  let longURL = req.body.longURL;
  // Add https, unless http is already specified
  if (longURL.slice(0, 4) !== "http") {
    longURL = "https://" + longURL;
  }
  if (longURL === "") {
    const templateVars = {
      user: userID,
      msg: "URL field cannot be blank"
    }
    return res.render('urls_new', templateVars);
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL,
    userID
  };
  res.redirect(`/urls/${shortURL}`);
});

// Generate form for user to submit new URL, user must be logged in!
app.get("/urls/new", (req,res) => {
  const userID = req.session.user_id;
  if (!userID) {
    const templateVars = {
      user: null,
      msg: "You need to sign-in to be able to create a new URL"
    };
    res.statusCode = 403;
    res.statusMessage = templateVars.msg;
    return res.render("login", templateVars);
  }
  const templateVars = {
    user: users[userID],
    msg: null
  };
  res.render('urls_new', templateVars);
});

app.post("/urls/:id/delete", (req,res) => {
  const userID = req.session.user_id;
  const userURLs = getUserUrls(userID, urlDatabase);
  const shortURL = req.params.id;
  if (!userID) {
    return res.status(403).send("Action prohibited: Please sign-in to reach this url. <a href='/login'>Login Page</a>")
  }
  if (!userURLs[shortURL]) {
    return res.status(403).send("Action prohibited: You can't delete someone elses url.");
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// Redirects to edit link page
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const userURLs = getUserUrls(userID, urlDatabase);
  const shortURL = req.params.shortURL;
  if (!userID) {
    return res.status(403).send("Action prohibited: Please sign-in to reach this url. <a href='/login'>Login Page</a>")
  }
  if (!userURLs[shortURL]) {
    return res.status(403).send("Action prohibited: If this url exists, you don't have access to it")
  } else {
    const longURL = urlDatabase[shortURL].longURL;
    const templateVars = {
      shortURL: shortURL,
      longURL: longURL,
      user: users[req.session.user_id]
    };
    return res.render('urls_show', templateVars);
  }
});

// Redirect to longURL
app.get("/u/:shortURL", (req,res) => {
  const shortURL = req.params.shortURL;
  if (!(urlDatabase[shortURL])) {
    return res.redirect('/*');
  }
  const longURL = urlDatabase[shortURL].longURL;
  return res.redirect(longURL);
});

// Update longURL corresponding to id => (shortURL)
app.post("/urls/:id", (req,res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(403).send("Action prohibited: Please sign-in to reach this url. <a href='/login'>Login Page</a>");
  }
  const userURLs = getUserUrls(userID, urlDatabase);
  const shortURL = req.params.id;
  if (!userURLs[shortURL]) {
    return res.status(403).send("Action prohibited: You can't delete someone elses url. <a href='/urls'>Return</a>")
  }
  let longURL = req.body.newLongURL
  // Add https, unless http is already specified
  if (longURL.slice(0, 4) !== "http") {
    longURL = "https://" + longURL;
  }
  urlDatabase[shortURL].longURL = longURL;
  res.redirect('/urls');
});

// Handle all invalid path requests
app.get("/*", (req,res) => {
  res.statusCode = 404;
  res.statusMessage = "Page Not Found";
  res.write("<h1>404 Page Not Found</h1>");
  res.end();
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});