const { EMAIL_REGEX } = require("../constants/index");

const isValidEmailFormat = (email) => {
  return EMAIL_REGEX.test(String(email).toLowerCase());
};

const isValidPasswordFormat = (password) => {
  return PASSWORD_REGEX.test(String(password))
};

function getRandomFourDigit() {
  return Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
}

module.exports = {
  isValidEmailFormat,
  isValidPasswordFormat,
  getRandomFourDigit,
};
