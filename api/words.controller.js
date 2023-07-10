import dotenv from "dotenv";
import jwt from "jwt-simple";

import WordsDAO from "../db/wordsDAO.js";
import UsersDAO from "../db/usersDAO.js";
import CollectionsDAO from "../db/collectionsDAO.js";

import { ObjectId } from "mongodb";
import DictsDAO from "../db/dictsDAO.js";

dotenv.config();

export default class WordsController {
  static async apiGetWord(req, res, next) {
    try {
      const { word, wordid, collection } = req.query;
      console.log(req.query);
      const token = req.headers.authorization || req.headers.token;
      // console.log(req.headers);
      // 对token进行解密获取其中的openid
      const openid = jwt.decode(token, process.env.SECRET);
      console.log("login openid", openid);
      const user = await UsersDAO.getUserByOpenId(openid);
      const current_dict = user.current_dict;
      console.log("current_dict", current_dict);
      console.log(`apiGetWord, word: ${word}`);
      let wordData = await WordsDAO.getWord(collection, word, wordid);
      if (!wordData) {
        res.status(404).json([]);
        return;
      }
      res.json(wordData);
    } catch (e) {
      console.log(`api, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  static async apiCollectWord(req, res, next) {
    try {
      let wordId = req.params.wordId || {};
      const token = req.headers.authorization || req.headers.token;
      const word = req.body.word || "";
      // console.log(req.headers);
      // 对token进行解密获取其中的openid
      const openid = jwt.decode(token, process.env.SECRET);
      console.log("login openid", openid);
      const user = await UsersDAO.getUserByOpenId(openid);
      if (!user) {
        res.status(404).json({ error: "User Not found" });
        return;
      }
      const current_dict = user.current_dict;
      const dict = await DictsDAO.getDictName(current_dict);
      console.log("current_dict", current_dict);
      console.log(`apiCollectWord, wordId: ${wordId}`);
      const data = {
        wordId: new ObjectId(wordId),
        word: word,
        openid: openid,
        dict: dict,
        collection: current_dict,
        time: new Date(),
      }
      console.log("collect word", data);
      const updateResponse = await CollectionsDAO.updateCollectWord(data);
      console.log("updateResponse", updateResponse);
      res.status(200).json(updateResponse);
    } catch (e) {
      console.log(`apiCollectWord, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  // 添加用户错词
  static async apiAddWrongWord(req, res, next) {
    try {
      let wordId = req.params.wordId || {};
      const token = req.headers.authorization || req.headers.token;
      // console.log(req.headers);
      // 对token进行解密获取其中的openid
      const openid = jwt.decode(token, process.env.SECRET);
      console.log("login openid", openid);
      const user = await UsersDAO.getUserByOpenId(openid);
      if (!user) {
        res.status(404).json({ error: "User Not found" });
        return;
      }
      const current_dict = user.current_dict;
      console.log("current_dict", current_dict);
      console.log(`apiAddWrongWord, wordId: ${wordId}`);
      const data = {
        wordId: wordId,
        openid: openid,
        current_dict: current_dict,
        time: new Date(),
      }
      const updateResponse = await CollectionsDAO.addWrongWord(data);
      console.log("updateResponse", updateResponse);
      res.json(updateResponse);
    } catch (e) {
      console.log(`apiAddWrongWord, ${e}`);
      res.status(500).json({ error: e });
    }
  }
}