import jwt from "jwt-simple";
import dotenv from "dotenv";
import UsersDAO from "../db/usersDAO.js";

dotenv.config();

const SECRET = process.env.SECRET

const verifyUsers = async (req, res, next) => {
  const token = req.headers.authorization || req.headers.token;
  if (token) {
    console.log('请求带有token');
    try {
      const openId = jwt.decode(token, SECRET);
      console.log("verifyUsers", openId);
      const user = await UsersDAO.getUserByOpenId(openId);
      if (user) {
        await next();
      } else {
        res.status(400).send({ error: "no user" })
      }
    } catch (err) {
      res.status(401).send({ msg: 'token有误' })
    }
  } else {
    console.log('请求没有带token');
  }

}


export {
  verifyUsers,
}