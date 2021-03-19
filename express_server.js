
const express = require("express");
const app = express();

const PORT = 8080;
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { checkEmail, generateRandomString, urlsForUserId, findIdByEmail } = require('./helpers.js');

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
})
);

app.use(morgan('short'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userid34treg"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "useridrt88ev"
  }
};

const users = {
  "userid34treg": {
    id: "userid34treg",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", saltRounds),
  },
  "useridrt88ev": {
    id: 'useridrt88ev',
    email: "jlee4332@gmail.com",
    password: bcrypt.hashSync("1234", saltRounds),
  },
  "userid34treg": {
    id: "useridl18hby",
    email: "hello@gmail.com",
    password: bcrypt.hashSync('hello', saltRounds),
  }
};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/login.json", (req, res) => {
  res.json(users);
});


const addNewUser = (email, password, users) => {
  const userId = 'userid' + `Math.random().toString(36).substring(2, 8)`;

  const newUser = {
    id: userId,
    email,
    password: bcrypt.hashSync(password, saltRounds)
  };

  users[userId] = newUser;
  return userId;

};

const authenticateUser = (email, password, usersDb) => {
  let user = findIdByEmail(email, usersDb);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user.id;
  }
  return false;
};

app.get("/urls", (req, res) => {
  let filteredUrls = urlsForUserId(req.session.user_id, urlDatabase);
  console.log("users reqsession", users[req.session.user_id]);
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
  console.log("updateurlDB", urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(urlDatabase);
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } res.redirect('/urls');
});

const updateLongUrl = (shortURL, content) => {
  urlDatabase[shortURL].longURL = content;
};

app.post('/urls/:shortURL/edit', (req, res) => {
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
  updateLongUrl(shortURL, longURL);
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
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


