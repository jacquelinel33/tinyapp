
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
app.use(morgan('short'));



app.use(cookieParser());

app.set('view engine', 'ejs');


const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

//object of shortURL: longURL
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

//urls/new will display a form to enter a http://url to submit. when a request is made to /urls/new, the EJS file urls_new will render.
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
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
    username: req.cookies["username"]
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
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});


const updateLongUrl = (editURL, content) => {
  urlDatabase[editURL] = content;
};

app.post('/urls/:shortURL/edit', (req, res) => {
  let shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

//when longURL is submitted in the edit url
app.post('/urls/:editURL', (req,res) => {
  //extract the editURL from path
  const editURL = req.params.editURL;
  console.log("editURL", editURL);
  //get contents of form (longURL)
  const urlContent = req.body['url-edit'];
  console.log(req.body);
  updateLongUrl(editURL, urlContent);
  res.redirect('/urls');
});

//Login
app.post('/login', (req,res) => {
  const loginContent = req.body['username'];
  res.cookie('username', loginContent);
  res.redirect('/urls');
});




