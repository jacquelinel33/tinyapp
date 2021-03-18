
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bodyParser = require("body-parser");

app.use(morgan('short'));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "hellojello"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "l18hby"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "hellojello": {
    id: "hellojello",
    email: "jlee4332@gmail.com",
    password: "1234"
  },
  "l18hby": {
    id: "l18hby",
    email: "hello@gmail.com",
    password: "hello",
  }
};


const addNewUser = (email, password) => {
  const userId = Math.random().toString(36).substring(2, 8);

  const newUser = {
    id: userId,
    email,
    password,
  };

  users[userId] = newUser;
  return userId;

};

const findIdByEmail = email => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return false;
};

const authenticateUser = (email, password) => {
  let user = findIdByEmail(email);
  if (user.password === password) {
    console.log(user.email);
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

const shortUrlById = user_id => {
  for (let shortUrl in urlDatabase) {
    return shortUrl;
  }
  //     if(urlDatabase[shortUrl].userID === user_id) {
  //       return shortUrl;
  //     }
  //   }
  //  return false;
};
//when a request is made to /urls. EJS file urls_index will render. In the EJS file, will use key urls to refer to the urlDatabase object.
app.get("/urls", (req, res) => {
  let shortUrl = shortUrlById(req.cookies.user_id);
  const templateVars = {
    // urls: urlDatabase,
    urls: urlDatabase,
    user: users[req.cookies.user_id],

  };
  console.log("template", templateVars)
  res.render("urls_index", templateVars);
});

//urls/new will display a form to enter a http://url to submit. when a request is made to /urls/new, the EJS file urls_new will render.
app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id) {
    const templateVars = {
      user: users[req.cookies.user_id],
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
    userID: req.cookies.user_id
  };
  console.log("updateurlDB", urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});


//
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies.user_id],
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

//to show in browser the json data of urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//post request when delete button is pressed. removes the shortURL from urlDatabase and redirect to /urls
app.post('/urls/:shortURL/delete', (req, res) => {
  // if (urlDatabase[req.params.shortURL]) {
    if (urlDatabase[req.params.shortURL].userID === req.cookies.user_id) {
      delete urlDatabase[req.params.shortURL];
      res.redirect('/urls');
    } res.redirect('/urls');

  // } res.redirect('/urls');


  //  === req.cookies.user_id) {
  //   console.log(urlDatabase[req.params.shortURL])
  //   delete urlDatabase[req.params.shortURL];
  //   res.redirect('/urls');
  // } else {
  //   res.redirect('/urls');
  // }
  // console.log("params",req.params);
  // console.log("db",urlDatabase)
});


const updateLongUrl = (shortURL, content) => {
  urlDatabase[shortURL].longURL = content;
};


//when edit button is clicked
app.post('/urls/:shortURL/edit', (req, res) => {
  // if database use id = cookies userid(logged in)
  if (urlDatabase[req.params.shortURL].userID === req.cookies.user_id) {
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
  const user_id = authenticateUser(email, password);
  if (user_id) {
    res.cookie('user_id', user_id);
    console.log(req.cookies)
    res.redirect('/urls');
  } else {
    res.status(403).send('Wrong login');
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user_id = addNewUser(email, password);
  res.cookie('user_id', user_id);
  res.redirect('/urls');
});