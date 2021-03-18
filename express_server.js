
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


//object of shortURL: longURL
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
    email: "jlee4332@gmail.com",
    password: "1234"
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
    return user.email;
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
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.userId],
  };
  res.render("urls_index", templateVars);
});

//urls/new will display a form to enter a http://url to submit. when a request is made to /urls/new, the EJS file urls_new will render.
app.get("/urls/new", (req, res) => {
  if(req.cookies.newId) {
    const templateVars = {
      user: users[req.cookies.userId],
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

//when a post/input is put into the /urls page, the generateRandomString will run to get a random shortURL. Will add that shortURL to the urlDatabase object with the req.body.longURL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies.userId],
  };
  const longURL = req.params.shortURL;
  console.log(longURL);
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

//to show in browser the json data of urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//post request when delete button is pressed. removes the shortURL from urlDatabase and redirect to /urls
app.post('/urls/:shortURL/delete', (req, res) => {
  if(urlDatabase[req.params.shortURL].usersId === req.cookies.userId) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});


const updateLongUrl = (editURL, content) => {
  urlDatabase[editURL] = content;
};

app.post('/urls/:shortURL/edit', (req, res) => {
  //if database use id = cookies userid(logged in)
  if (urlDatabase[req.params.shortURL].userId === req.cookies.userId) {
    let shortURL = req.params.shortURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect('/login');
  }

});

//when longURL is submitted in the edit url
app.post('/urls/:editURL', (req, res) => {
  //extract the editURL from path
  const editURL = req.params.editURL;
  console.log("editURL", editURL);
  //get contents of form (longURL)
  const urlContent = req.body['url-edit'];
  console.log(req.body);
  updateLongUrl(editURL, urlContent);
  res.redirect('/urls');
});

//displays login page when login is clicked
app.get('/login', (req, res) => {
  res.render('login');
});


app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = authenticateUser(email, password);
  if (userId) {
    res.cookie('user_id', userId);
    res.redirect('/urls');
  } else {
    res.status(403).send('Wrong login');
  }
});



app.post('/logout', (req, res) => {
  res.clearCookie('userId');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = addNewUser(email, password);
  res.cookie('userId', userId);
  res.redirect('/urls');
});

