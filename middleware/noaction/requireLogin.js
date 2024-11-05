const express = require('express');
const { Request, Response, NextFunction } = express;
const { Messages, responseData } = require("../utils/responseData");
const { verifyToken } = require("../../utils/jwt");
const db = require("../../utils/db");

exports.requireLogin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json(responseData(false, Messages.UNAUTHORIZED));
    }

    const decodedToken = verifyToken(token);
    if (!decodedToken || typeof decodedToken === "string") {
      return res.status(401).json(responseData(false, Messages.UNAUTHORIZED));
    }

    const user = await db.user.findFirst({ where: { accesstoken: token } });

    if (!user) {
      return res.status(401).json(responseData(false, Messages.UNAUTHORIZED));
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.log(error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json(responseData(false, "Token expired"));
    }
    res.status(500).json(responseData(false, Messages.INTERNAL_SERVER_ERROR));
  }
};

