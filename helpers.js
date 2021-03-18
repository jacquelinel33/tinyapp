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
    if(users[userId].email === email) {
      return users[userId];
    }
  }
  return false;
};

const authenticateUser = (email , password) => {
  let user = findIdByEmail(email);
  if(user.password === password) {
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

module.exports = { addNewUser, findIdByEmail, authenticateUser, generateRandomString }


















const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};
