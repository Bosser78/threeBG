const jwt = require("jsonwebtoken")
const crypto = require("crypto")

module.exports = {
  generateToken(user) {
    return jwt.sign(
      {
        username: user.username,
        user_ciz_id: user.user_ciz_id,
        user_tel: user.user_tel,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1d",
        algorithm: "HS256",
      }
    )
  },

  generateRefetchToken(user) {
    return jwt.sign(
      {
        username: user.username,
        user_ciz_id: user.user_ciz_id,
        user_tel: user.user_tel,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1y",
        algorithm: "HS256",
      }
    )
  },

  verifyToken(token) {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  },

  verifyRefetchToken(token) {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
  },

  generateRefreshToken() {
    return crypto.randomBytes(64).toString("hex")
  }
}

