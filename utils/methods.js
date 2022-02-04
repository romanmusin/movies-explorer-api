const validator = require('validator');

module.exports.isValidUrl = (url) => {
  const valided = validator.isURL(url);
  if (valided) {
    return url;
  }
  throw new Error('Некорректная ссылка');
};
