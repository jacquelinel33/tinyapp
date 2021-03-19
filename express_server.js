
const express = require("express");
const app = express();

const PORT = 8080;
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const saltRounds = 10;


app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
})
);


app.use(morgan('short'));
// app.use(cookieParser());
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

//to show in browser the json data of urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/login.json", (req, res) => {
  res.json(users);
});

const checkPassword = (inputPw, usersDb) => {
  const encryptPw = bcrypt.hashSync(inputPw, saltRounds);
  for (let id in users) {
    if (usersDb[id].password === encryptPw) {
      return true;
    }
  }
};

const checkEmail = (email, usersDb) => {
  console.log("pass");
  for (let id in usersDb) {
    if (usersDb[id].email === email) {

      return true;
    }
  }
};

const addNewUser = (email, password) => {
  const userId = 'userid' + `Math.random().toString(36).substring(2, 8)`;

  const newUser = {
    id: userId,
    email,
    password: bcrypt.hashSync(password, saltRounds)
  };

  users[userId] = newUser;
  return userId;

};

//hashing password
//npm i bcrypt
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
// in addNewUser
//password: bcrypt.hashSync(password, saltRounds)
//change any pw comparisons of plain text to hashed 
//to check bcrypt.compareSync
//dont want cookie in plain text. because others can access profile by changing it in the application window
//use encryption
//cookie-session
//disable cookie parser
//nom install cookie-session
//replace all instances of cookie parser with cookie-session
//res.cookie('user_id', user_id) = req.session['user_id'] = user_id
//res.clearCookie() = req.session['cookiename'] = null;
// req.cookies['user_id'] = req.session['user_id']




const findIdByEmail = email => {
  for (let id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return false;
};


//if user exists and if bcrypt password = user.password and returns user id
const authenticateUser = (email, password) => {
  let user = findIdByEmail(email);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user.id;
  }
  return false;
};


//function to generate shortURL;
const generateRandomString = () => {
  const chars = 'abcdefghijklmnop0123456789';
  let random = "";
  for (let x = 0; x < 6; x++) {
    let ranIndex = Math.floor(Math.random() * chars.length);
    random += chars[ranIndex];
  } return random;
};

//when a request is made to /urls. EJS file urls_index will render. In the EJS file, will use key urls to refer to the urlDatabase object.

app.get("/urls", (req, res) => {
  let filteredUrls = urlsForUserId(req.session.user_id, urlDatabase);
  console.log("users reqsession", users[req.session.user_id]);
  const templateVars = {
    urls: filteredUrls,
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});

//return filtered urldatabase matching userId 
const urlsForUserId = (userId, urlDatabase) => {
  const newDb = {};
  for (let shorturl in urlDatabase) {
    if (urlDatabase[shorturl].userID === userId) {
      newDb[shorturl] = urlDatabase[shorturl];
    }
  } return newDb;
};



//urls/new will display a form to enter a http://url to submit. when a request is made to /urls/new, the EJS file urls_new will render.
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
  }
  else {
    res.redirect('/login');
  }
});

//when a post/input is put into the /urls page, the generateRandomString will run to get a random shortURL. Will add that shortURL to the urlDatabase object with the req.body.longURL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  //add new url to database with user id and long url
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  console.log("updateurlDB", urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});


//
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



//post request when delete button is pressed. removes the shortURL from urlDatabase and redirect to /urls
app.post('/urls/:shortURL/delete', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } res.redirect('/urls');
});


const updateLongUrl = (shortURL, content) => {
  urlDatabase[shortURL].longURL = content;
};


//when edit button is clicked
app.post('/urls/:shortURL/edit', (req, res) => {
  // if what's in the database matches cookie info, then proceed with changes
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    let shortURL = req.params.shortURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect('/urls');
  }
});

//when longURL is submitted in the edit url
app.post('/urls/:editURL', (req, res) => {
  //extract the editURL from path
  const shortURL = req.params.editURL;
  //get contents of form (longURL)
  const longURL = req.body['url-edit'];
  updateLongUrl(shortURL, longURL);
  res.redirect('/urls');
});

//displays login page when login is clicked
app.get('/login', (req, res) => {
  res.render('login');
});

//when email and password are entered into login page
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //checks if user and password match
  const user_id = authenticateUser(email, password);
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
  //check if email or pw empty
  if (!email || !password) {
    res.status(400).send('You must enter an email and password');
  }
  else if (checkEmail(email, users)) {
    res.status(400).send('Email already exists');
  }
  //check if email already exist
  else {
    const user_id = addNewUser(email, password);
    req.session['user_id'] = user_id;
    res.redirect('/urls');
  }
});


