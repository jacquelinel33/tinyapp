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

const urlsForUserId = (userId, urlDatabase) => {
  const newDb = {};
  for (let shorturl in urlDatabase) {
    if (urlDatabase[shorturl].userID === userId) {
      newDb[shorturl] = urlDatabase[shorturl];
    }
  } return newDb;
};

module.exports = { checkEmail, generateRandomString, findIdByEmail, urlsForUserId };

















