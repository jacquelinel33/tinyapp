const bcrypt = require('bcrypt');
const saltRounds = 10;

const users = {
};

//Creates new userId
const addNewUser = (email, password, users) => {
  const userId = Math.random().toString(36).substring(2, 8);
  
  const newUser = {
    id: userId,
    email,
    password: bcrypt.hashSync(password, saltRounds)
  };
  
  users[userId] = newUser;
  return userId;
  
};


const updateLongUrl = (shortURL, content, userDb) => {
  userDb[shortURL].longURL = content;
};

//checks if email and password provided exists and matches
const authenticateUser = (email, password, usersDb) => {
  let user = findIdByEmail(email, usersDb);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user.id;
  }
  return false;
};

const checkEmail = (email, usersDb) => {
  for (let id in usersDb) {
    if (usersDb[id].email === email) {

      return true;
    }
  }
};

const generateRandomString = () => {
  const chars = 'abcdefghijklmnop0123456789';
  let random = "";
  for (let x = 0; x < 6; x++) {
    let ranIndex = Math.floor(Math.random() * chars.length);
    random += chars[ranIndex];
  } return random;
};

const findIdByEmail = (email, users) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

//returns a filtered url database according to user
const urlsForUserId = (userId, urlDatabase) => {
  const newDb = {};
  for (let shorturl in urlDatabase) {
    if (urlDatabase[shorturl].userID === userId) {
      newDb[shorturl] = urlDatabase[shorturl];
    }
  } return newDb;
};

module.exports = { checkEmail, generateRandomString, findIdByEmail, urlsForUserId, addNewUser, authenticateUser, updateLongUrl };

















