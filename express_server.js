
const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { checkEmail, generateRandomString, urlsForUserId, addNewUser, authenticateUser, updateLongUrl } = require('./helpers.js');

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
})
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('short'));
app.set('view engine', 'ejs');


const urlDatabase = {
  
};

const users = {

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

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});

//fetches and dsiplays shortURL for logged in user
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session.user_id],
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send('You do not have access to this link');
  }
});

//redirects shortURL to longURL address
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL === undefined) {
    res.status(404);
  }
  res.redirect(longURL);
});

app.get('/urls/:shortURL/delete', (req, res) => {
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

// const updateLongUrl = (shortURL, content, userDb) => {
//   userDb[shortURL].longURL = content;
// };

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
    res.status(403).send('Wrong login');
  }
});

app.get('/logout', (req, res) => {
  req.session['user_id'] = null;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  res.render('register');
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send('You must enter an email and password');
  } else if (checkEmail(email, users)) {
    res.status(400).send('Email already exists');
  } else {
    const user_id = addNewUser(email, password, users);
    req.session['user_id'] = user_id;
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

