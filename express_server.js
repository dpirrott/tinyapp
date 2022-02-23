const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { 
  urlDatabase, 
  users, 
  userCheck, 
  printUsers,
  generateRandomString 
} = require('./helpers/helperFunctions');

app.use(bodyParser.urlencoded({extended: true}), cookieParser());

app.set("view engine", "ejs");

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
  const { email, password } = req.body;
  const { user, msg, error } = userCheck(email, password, false);

  if (error || user) {
    const templateVars = { user, msg };
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
  const { email, password} = req.body;
  const { user, msg, error } = userCheck(email, password, true);

  if (error || !user) {
    const templateVars = { user: user, msg: msg };
    res.statusCode = 403;
    res.render("login", templateVars);
  } else {
    res.cookie("user_id", user.id);
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
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!(urlDatabase[shortURL])) {
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

// Redirect to longURL
app.get("/u/:shortURL", (req,res) => {
  const shortURL = req.params.shortURL;
  if (!(shortURL in urlDatabase)) {
    return res.redirect('/*');
  }
  const longURL = urlDatabase[shortURL];
  return res.redirect(longURL);
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