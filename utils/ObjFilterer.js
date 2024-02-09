module.exports = (obj, ...allowed) => {
  const newObj = { ...obj };

  Object.keys(newObj).forEach((el) => {
    if (!allowed.includes(el)) {
      delete newObj[el];
    }
  });

  return newObj;
};
