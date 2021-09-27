const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bodyParser = require("body-parser");
const { checkEmail, generateRandomString, urlsForUserId, addNewUser, authenticateUser, updateLongUrl } = require('./helpers.js');

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/login.json", (req, res) => {
  res.json(users);
});

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
})
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('short'));
app.set('view engine', 'ejs');

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

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('login');
  }
});

app.get("/urls", (req, res) => {
  let filteredUrls = urlsForUserId(req.session.user_id, urlDatabase);
  const templateVars = {
    urls: filteredUrls,
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

//post requests will have a body, get requests will not
app.post("/urls", (req, res) => {
  console.log(req.body);
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});

//fetches and displays shortURL for logged in user
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session.user_id],
    };
    res.render("urls_show", templateVars);
  } else {
    return res.status(400).send('You do not have access to this link');
  }
});

//redirects shortURL to longURL address
app.get("/u/:shortURL", (req, res) => {
  console.log("req.params", req.params)
  console.log(urlDatabase);
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL === undefined) {
    return res.status(404);
  }
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } res.redirect('/urls');
});

app.get('/urls/:shortURL/edit', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    let shortURL = req.params.shortURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect('/urls');
  }
});

app.post('/urls/:editURL', (req, res) => {
  const shortURL = req.params.editURL;
  const longURL = req.body['url-edit'];
  updateLongUrl(shortURL, longURL, urlDatabase);
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  res.render('login');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user_id = authenticateUser(email, password, users);
  if (user_id) {
    req.session['user_id'] = user_id;
    res.redirect('/urls');
  } else {
    return res.status(403).send('Wrong login');
  }
});

app.get('/logout', (req, res) => {
  req.session['user_id'] = null;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.render('register');
  }
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
     return res.status(400).send('You must enter an email and password');
  } else if (checkEmail(email, users)) {
    return res.status(400).send('Email already exists');
  } else {
    const user_id = addNewUser(email, password, users);
    req.session['user_id'] = user_id;
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
