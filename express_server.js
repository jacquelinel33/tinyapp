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
  f3es45: { longURL: 'https://www.google.ca', userID: 'userRandomID' },
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'aJ48lW' },
  i3BoGr: { longURL: 'https://www.google.ca', userID: 'aJ48lW' },
};



const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  aJ48lW: {
    id: 'aJ48lW',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
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
  // templateURLs {
  // urls: {
  //   gbom85: { longURL: 'http://google.com', userID: '5c90jj' },
  //   nghbmo: { longURL: 'www.facebook.com', userID: '5c90jj' }
  // },
  // user: {
  //   id: '5c90jj',
  //   email: 'hello@gmail.com',
  //   password: '$2b$10$npyV3qYHIHk5OyMgLxGW/eeHvEvN8wyVJg5VVoOgYmZI8xaca0yqe'
  // }
// }
  const templateVars = {
    urls: filteredUrls,
    user: users[req.session.user_id],
  };
  console.log("templateURLs", templateVars)
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
  console.log("req.params",req.params)
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
    return res.status(404).send('URL not Found');
  }
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } res.redirect('/urls');
});

// app.get('/urls/:id, (req, res) => {
//   if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
//     let shortURL = req.params.shortURL;
//     res.redirect(`/urls/${shortURL}`);
//   } else {
//     res.redirect('/urls');
//   }
// });

app.post('/urls/:edit', (req, res) => {
  console.log("req.params.edit", req.params)
  const shortURL = req.params.edit;
  const longURL = req.body.longURL;
  const userId = req.session['user_id'];

  // boolean: true if the urls belongs to that user
  const urlBelongsToUser =
    urlDatabase[shortURL] && urlDatabase[shortURL].userID === userId;

  if (urlBelongsToUser) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect('/urls');
    return;
  }

  const templateVars = {
    user: users[req.session['user_id']],
  };

  res.render('error_url', templateVars);
});

app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
    return;
  } const templateVars = {
    user: null
  }
  res.render('login', templateVars);
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

app.post('/logout', (req, res) => {
  req.session['user_id'] = null;
  res.redirect('/urls');
});


app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
    return;
  } else {
    const templateVars = {
      user: null,
    };
    res.render('register', templateVars);
  }
});

app.post('/register', (req, res) => {
  console.log("req.body-register", req.body)
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
     return res.status(400).send('You must enter an email and password');
  } else if (checkEmail(email, users)) {
    return res.status(400).send('Email already exists');
  } else {
    const user_id = addNewUser(email, password, users);
    //res.cookie('user_id', userID)
    req.session['user_id'] = user_id;
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
