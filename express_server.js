const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(bodyParser.urlencoded({extended: true}), cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let randomString = "";
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 6; i++) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }
  return randomString;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.post("/login", (req,res) => {
  const username = req.body["username"];
  res.cookie("username", username);
  res.redirect('/urls');
});

app.post("/logout", (req,res) => {
  res.clearCookie("username");
  res.redirect("/urls")
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies.username
  };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req,res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/u/${shortURL}`);
});

app.get("/urls/new", (req,res) => {
  const templateVars = { 
    username: req.cookies.username
  };
  res.render('urls_new', templateVars);
});

app.post("/urls/:shortURL/delete", (req,res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls')
});

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
    }
    console.log(`ShortURL: ${shortURL} --- LongURL: ${longURL}`);
    res.render('urls_show', templateVars);
  }
});

app.post("/urls/:id", (req,res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.newLongURL
  res.redirect('/urls');
});

app.get("/*", (req,res) => {
  console.log("Someone tried going where they don't belong ;)")
  res.statusCode = 404;
  res.write("<h1>404 Page Not Found</h1>");
  res.end();
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});