const bcrypt = require("bcrypt");

// hash
exports.hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) reject(err);
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) reject(err);
        resolve(hash);
      });
    });
  });
};

// compare || decrypt password
exports.comparePassword = (password, hashed) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hashed, (err, isMatch) => {
      if (err) reject(err);
      resolve(isMatch);
    });
  });
};
