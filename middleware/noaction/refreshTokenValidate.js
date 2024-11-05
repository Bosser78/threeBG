const jwt = require('jsonwebtoken');

const refreshTokenValidate = (req, res, next) => {
  try {
    if (!req.body.refreshtoken) return res.sendStatus(401);

    const token = req.body.refreshtoken;
    jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          throw new Error(err.message);
        } else {
          req.user = decoded;
          delete req.user.exp;
          delete req.user.iat;
          next();
        }
      }
    );
  } catch (error) {
    return res.sendStatus(403);
  }
};

module.exports = refreshTokenValidate;

