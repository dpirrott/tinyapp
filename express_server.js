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

const generateRandomString = function() {
  let randomString = "";
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 6; i++) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }
  return randomString;
};

// Considering the home directory incomplete, for now redirect to URL summary page
app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.post("/login", (req,res) => {
  const username = req.body["username"];
  res.cookie("username", username);
  res.redirect('/urls');
});

app.post("/logout", (req,res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

// Display users URL's summary
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies.username
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
    username: req.cookies.username
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
      username: req.cookies.username
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