const createShareCode = () => {
  return Math.random().toString(36).substring(2, 12).toUpperCase();
};

export default createShareCode;
