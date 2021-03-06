const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');
const {
  userCheck,
  generateRandomString,
  getUserUrls,
  visitCount,
  uniqueVisits
} = require('./helpers/helperFunctions');
const urlDatabase = require('./databases/urlDatabase');
const users = require('./databases/usersDatabase');

app.use(
  bodyParser.urlencoded({extended: true}), 
  cookieSession({
    name: 'session',
    keys: ['super secret master key']
  }),
  methodOverride('_method')
);

app.set("view engine", "ejs");

// Considering the home directory incomplete, for now redirect to URL summary page
app.get("/", (req, res) => {
  const userID = req.session.userID;
  if (!userID || !users[userID]) {
    return res.redirect("/login");
  }
  return res.redirect('/urls');
});

app.get("/register", (req,res) => {
  const userID = req.session.userID;
  if (userID) {
    return res.redirect('/urls');
  }
  const templateVars = { user: users[req.session.userID], msg: undefined };
  res.render("register_user", templateVars);
});

app.post("/register", (req,res) => {
  const userId = generateRandomString(6);
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
    req.session.userID = userId;
    return res.redirect("/urls");
  }
});

app.get("/login", (req,res) => {
  const userID = req.session.userID;
  if (userID) {
    return res.redirect('/urls');
  }
  const templateVars = { user: null, msg: null };
  res.render("login", templateVars);
});

app.post("/login", (req,res) => {
  const { email, password} = req.body;
  const { user, msg, error } = userCheck(email, password, true, users);

  if (error || !user) {
    const templateVars = { user, msg };
    res.statusCode = 403;
    res.statusMessage = msg;
    res.render("login", templateVars);
  } else {
    req.session.userID = user.id;
    res.redirect('/urls');
  }
});

app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect("/login");
});

// Display users URL's summary
app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  if (!userID || !users[userID]) {
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
  const userID = req.session.userID;
  if (!userID || !users[userID]) {
    return res.status(403)
      .send("You must be logged in to create tinyURLs. <a href='/login'>Login Page</a>\n");
  }
  let longURL = req.body.longURL;
  if (longURL.length < 9) {
    const templateVars = {
      user: userID,
      msg: "URL field cannot be less then 9 characters"
    };
    res.statusCode = 403;
    res.statusMessage = templateVars.msg;
    return res.render('urls_new', templateVars);
  }
  // Add https if not already specified
  if (longURL.slice(0, 4) !== "http") {
    longURL = "https://" + longURL;
  }
  
  const shortURL = generateRandomString(6);
  const date = Date().split(' ');
  const dateDisplayed = `${date[1]}. ${date[2]}, ${date[3]} (${date[4]}) (${date[6][1]}${date[7][0]}${date[8][0]})`;
  urlDatabase[shortURL] = {
    longURL,
    userID,
    dateDisplayed,
    visits: [],
    visitCount,
    uniqueVisits
  };
  res.redirect(`/urls/${shortURL}`);
});

// Generate form for user to submit new longURL, user must be logged in!
app.get("/urls/new", (req,res) => {
  const userID = req.session.userID;
  if (!userID || !users[userID]) {
    const templateVars = {
      user: null,
      msg: "You need to login to create a new URL"
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

// Deletes specified shortURL, if it exists, user must be logged in!
app.delete("/urls/:id", (req,res) => {
  const userID = req.session.userID;
  const userURLs = getUserUrls(userID, urlDatabase);
  const shortURL = req.params.id;
  if (!userID || !users[userID]) {
    res.statusMessage = "Access denied: Must sign-in to reach this url";
    return res.status(403).send("Action prohibited: Please sign-in to reach this url. <a href='/login'>Login Page</a>");
  }
  if (!userURLs[shortURL]) {
    res.statusMessage = "Access denied: Must be account owner to access this url.";
    return res.status(403).send("Action prohibited: You can't delete someone elses url. <a href='/urls'>Return</a>");
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// Redirects to edit longURL page
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.userID;
  const userURLs = getUserUrls(userID, urlDatabase);
  const shortURL = req.params.shortURL;
  if (!userID || !users[userID]) {
    res.statusMessage = "Access denied: Must sign-in to reach this url";
    return res.status(403).send("Action prohibited: Please sign-in to reach this url. <a href='/login'>Login Page</a>");
  }
  if (!userURLs[shortURL]) {
    res.statusMessage = "Access denied: Must be account owner to access this url.";
    return res.status(403).send("Action prohibited: If this url exists, you don't have access to it. <a href='/urls'>Return</a>");
  } else {
    const longURL = urlDatabase[shortURL].longURL;
    const totalVisits = urlDatabase[shortURL].visits;
    const visitCount = urlDatabase[shortURL].visitCount(totalVisits);
    const uniqueVisits = urlDatabase[shortURL].uniqueVisits(totalVisits);
    const templateVars = {
      shortURL,
      longURL,
      visitCount,
      uniqueVisits,
      totalVisits,
      user: users[req.session.userID],
      msg: null
    };
    return res.render('urls_show', templateVars);
  }
});

// Redirects to longURL, public access permitted
app.get("/u/:shortURL", (req,res) => {
  const shortURL = req.params.shortURL;
  if (!(urlDatabase[shortURL])) {
    return res.redirect('/*');
  }
  
  // If not logged in, generate visitor ID for tracking
  const userID = req.session.userID ? req.session.userID : generateRandomString(6);

  // Create visit date
  const date = Date().split(' ');
  const dateDisplayed = `${date[1]}. ${date[2]}, ${date[3]} (${date[4]}) (${date[6][1]}${date[7][0]}${date[8][0]})`;
  // Create visit object and push to url visits array
  const visitData = {
    userID,
    dateDisplayed
  }
  urlDatabase[shortURL].visits.push(visitData);
  
  const longURL = urlDatabase[shortURL].longURL;
  return res.redirect(longURL);
});

// Update longURL corresponding to id => (shortURL)
app.put("/urls/:id", (req,res) => {
  const userID = req.session.userID;
  if (!userID || !users[userID]) {
    res.statusMessage = "Access denied: Must sign-in to reach this url";
    return res.status(403).send("Action prohibited: Please sign-in to reach this url. <a href='/login'>Login Page</a>");
  }
  const userURLs = getUserUrls(userID, urlDatabase);
  const shortURL = req.params.id;
  
  if (!userURLs[shortURL]) {
    res.statusMessage = "Access denied: Must be account owner to access this url.";
    return res.status(403).send("Action prohibited: You can't update someone elses url. <a href='/urls'>Return</a>");
  }
  const originalLongURL = userURLs[shortURL].longURL;
  let longURL = req.body.newLongURL;
  if (longURL.length < 9) {
    const templateVars = {
      user: users[userID],
      shortURL,
      longURL: originalLongURL,
      msg: "URL field cannot be less then 9 characters"
    };
    res.statusCode = 403;
    res.statusMessage = templateVars.msg;
    return res.render('urls_show', templateVars);
  }
  // Add https, unless http is already specified
  if (longURL.slice(0, 4) !== "http") {
    longURL = "https://" + longURL;
  }
  urlDatabase[shortURL].longURL = longURL;
  return res.redirect('/urls');
});

// Handle all invalid path requests
app.get("/*", (req,res) => {
  res.statusCode = 404;
  res.statusMessage = "Page Not Found";
  res.write("<h1>404 Page Not Found</h1>");
  res.end();
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});