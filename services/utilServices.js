
const isValidEmailFormat = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const isValidPasswordFormat = (password) => {
  if (password.length < 8) {
    return false;
  }

  let upperCase = false;
  let numeric = false;
  let lowerCase = false;
  for (let i = 0; i < password.length; i++) {
    if (password[i] >= "a" && password[i] <= "z") {
      lowerCase = true;
    } else if (password[i] >= "A" && password[i] <= "Z") {
      upperCase = true;
    } else if (password[i] >= "0" && password[i] <= "9") {
      numeric = true;
    }
  }
  if (upperCase && lowerCase && numeric) {
    return true;
  }
  return false;
};

module.exports = {
  isValidEmailFormat,
  isValidPasswordFormat,
};
