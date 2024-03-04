import axios from "axios";
import jwt from "jwt-simple";
import dotenv from "dotenv";

import usersDAO from "../db/usersDAO.js";
import wordsDAO from "../db/wordsDAO.js";
import CollectionsDAO from "../db/collectionsDAO.js";
import calendarDAO from "../db/calendarDAO.js";
import RecordsDAO from "../db/recordsDAO.js";
import DictsDAO from "../db/dictsDAO.js";
import LearningDAO from "../db/learningDAO.js";

import userModel from "../models/user.model.js";
import checkModel from "../models/check.js";
import decryptPhoneNumber from "../utils/wxDecode.js";
import { getCurrentDate } from "../utils/tools.js";

dotenv.config();

const SECRET = process.env.SECRET;

const appId = process.env.APPID;
const appSecret = process.env.APPSECRET;
const grantType = 'authorization_code';


export default class LoginController {
  // 登录|注册
  static async apiLogin(req, res, next) {
    try {
      console.log(req.body);
      let code = req.body.code || {};
      let { iv, encryptedData } = req.body || {};
      console.log(`apiLogin, code: ${code}`);
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=${grantType}`;
      let session = await axios.get(url);
      console.log(session.data);
      const { session_key, openid } = session.data;
      console.log("session_key", session_key, "\nopenid", openid);
      // 解密用户信息
      const data = decryptPhoneNumber(session_key, encryptedData, iv);
      const { phoneNumber } = data;
      console.log('解密后 data: ', data)
      console.log("phoneNumber", phoneNumber);
      // 检查 user 是否存在
      const user = await usersDAO.getUserByOpenId(openid);
      if (!user) {
        const userObj = { ...userModel, openid, phone_number: phoneNumber }
        usersDAO.createUser(userObj)
        console.log("userObj", userObj);
      }
      // 根据用户的openid生成token
      const token = jwt.encode(openid, SECRET);
      console.log("openid", openid, "\ntoken", token);
      res.json({ token: token, openid: openid, session_key: session_key });
    } catch (e) {
      console.log(`api, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  static async apiGetToken(req, res, next) {
    try {
      let code = req.params.code || {};
      console.log(`apiGetToken, code: ${code}`);
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=${grantType}`;
      let session = await axios.get(url);
      console.log(session.data);
      const { openid } = session.data;
      // 检查 user 是否存在
      const user = await usersDAO.getUserByOpenId(openid);
      if (!user) {
        const userObj = { ...userModel, openid }
        usersDAO.createUser(userObj)
        console.log("userObj", userObj);
      }
      // 根据用户的openid生成token
      const token = jwt.encode(openid, SECRET);
      console.log("openid", openid, "\ntoken", token);
      res.json({ token: token, openid: openid });
    } catch (e) {
      console.log(`api, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  static async apiUpdateLogin(req, res, next) {
    try {
      let code = req.params.code || {};
      console.log("Raw Body:", req.rawBody);  // 手动输出原始请求体
      console.log("Parsed Body:", req.body);  // 手动输出解析后的请求体
      console.log(req.body);
      const userInfo = req.body;
      console.log(`apiGetToken, code: ${code}`);
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=${grantType}`;
      let session = await axios.get(url);
      console.log(session.data);
      const { openid } = session.data;
      // 检查 user 是否存在
      const user = await usersDAO.getUserByOpenId(openid);
      if (!user) {
        const userObj = { ...userModel, openid }
        usersDAO.createUser(userObj)
        console.log("userObj", userObj);
      }
      else if (user) {
        const filter = { openid: openid };
        const updatedFields = { ...user, username: userInfo.nickName, userInfo: userInfo }
        const updateUser = await usersDAO.updateDocumnet(filter, updatedFields);
        console.log("updateUser", updateUser);
      }
      // 根据用户的openid生成token
      const token = jwt.encode(openid, SECRET);
      console.log("openid", openid, "\ntoken", token);
      res.json({ token: token, openid: openid, userInfo: userInfo });
    } catch (e) {
      console.log(`api, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  static async apiUpdateUser(req, res, next) {
    try {
      let data = req.body || {};
      console.log(`apiUpdateUser, data: ${data}`);
      const token = req.headers.authorization;
      const openid = jwt.decode(token, SECRET);
      const user = await usersDAO.getUserByOpenId(openid);
      console.log("user", user);
      if (!user) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const filter = { openid: openid };
      const updatedFields = {
        ...user,
        dict_progress: {
          ...user.dict_progress,
          [user.current_dict]: {
            ...user.dict_progress[user.current_dict],
            times: user.dict_progress[user.current_dict].times + 1,
          }
        },

      };
      const updateResponse = await usersDAO.updateDocumnet(filter, updatedFields);
      console.log("updateResponse", updateResponse);
      res.json(updateResponse);
    } catch (e) {
      console.log(`apiUpdateUser, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  // 获取用于首页展示的用户信息
  static async apiGetUserDisplayInfo(req, res, next) {
    try {
      const token = req.headers.token || req.headers.authorization;
      console.log("token", token);
      const openid = jwt.decode(token, SECRET);
      const user = await usersDAO.getUserByOpenId(openid);
      console.log("user", user);
      if (!user) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const currentDict = user.current_dict;
      const dict = await DictsDAO.getDictName(currentDict);
      console.log("dict", dict);
      const dictSize = dict.size;
      const dictStudied = user.dict_progress[currentDict].count;
      const dictProgress = parseInt(dictStudied / dictSize * 100);
      // 获取用户今日需要复现的单词
      const _filter = { openid: openid, dict: currentDict, next: user.dict_progress[currentDict].times };
      const learningWords = await LearningDAO.getDocuments(_filter);
      const dayReviews = learningWords.length;
      const data = {
        day_new: user.day_new,
        day_reviews: dayReviews,
        current_dict: dict.dict,
        dict_studied: dictStudied,
        dict_size: dictSize,
        dict_progress: dictProgress,
      }
      res.json(data);
    } catch (e) {
      console.log(`apiGetUserDisplayInfo, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  // 更改用户学习计划
  static async apiUpdateUserPlan(req, res, next) {
    try {
      let data = req.body || {};
      console.log(`apiUpdateUserPlan, data: `, data);
      const token = req.headers.authorization;
      const openid = jwt.decode(token, SECRET);
      const user = await usersDAO.getUserByOpenId(openid);
      console.log("user", user);
      if (!user) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const filter = { openid: openid };
      const updatedFields = {
        ...user,
        ...data,
      };
      const updateResponse = await usersDAO.updateDocumnet(filter, updatedFields);
      console.log("updateResponse", updateResponse);
      res.json(updateResponse);
    } catch (e) {
      console.log(`apiUpdateUserPlan, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  // 获取用户词典列表
  static async apiGetUserDicts(req, res, next) {
    try {
      const token = req.headers.authorization;
      const openid = jwt.decode(token, SECRET);
      const user = await usersDAO.getUserByOpenId(openid);
      console.log("user", user);
      if (!user) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const dicts = Object.keys(user.dict_progress);
      console.log("dicts", dicts);
      res.json(dicts);
    } catch (e) {
      console.log(`apiGetUserDicts, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  // 获取用户信息
  static async apiGetUserInfo(req, res, next) {
    try {
      const token = req.headers.token || req.headers.authorization;
      const openid = jwt.decode(token, SECRET);
      const user = await usersDAO.getUserByOpenId(openid);
      console.log("user", user);
      if (!user) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(user);
    } catch (e) {
      console.log(`apiGetUserInfo, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  // 获取用户收藏的单词
  static async apiGetCollectWords(req, res, next) {
    try {
      const token = req.headers.token || req.headers.authorization;
      const openid = jwt.decode(token, SECRET);
      const user = await usersDAO.getUserByOpenId(openid);
      if (!user) {
        res.status(404).json({ error: "User Not Exist" });
        return;
      }
      const words = await CollectionsDAO.getUserCollectedWords(openid);
      console.log("words", words);
      res.json(words);
    } catch (e) {
      console.log(`apiGetCollectWords, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  // 获取用户错词 apiGetWrongWords
  static async apiGetWrongWords(req, res, next) {
    try {
      const token = req.headers.token || req.headers.authorization;
      const openid = jwt.decode(token, SECRET);
      const user = await usersDAO.getUserByOpenId(openid);
      if (!user) {
        res.status(404).json({ error: "User Not Exist" });
        return;
      }
      const words = await RecordsDAO.getWrongWords(openid);
      console.log("words", words);
      res.json(words);
    } catch (e) {
      console.log(`apiGetWrongWords, ${e}`);
      res.status(500).json({ error: e });
    }
  }


  // 添加用户打卡日历
  static async apiUpdateUserCheck(req, res, next) {
    try {
      const token = req.headers.authorization || req.headers.token;
      const openid = jwt.decode(token, SECRET);
      const user = await usersDAO.getUserByOpenId(openid);
      if (!user) {
        res.status(404).json({ error: "User Not Exist" });
        return;
      }
      const { number } = req.body || {};
      const data = {
        ...checkModel,
        openid: openid,
        number: number,
      };
      console.log("data", data);
      const result = await calendarDAO.addCalendar(data);
      console.log("result", result);
      res.json(result);
    } catch (e) {
      console.log(`apiUpdateUserCheck, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  // 获取用户本月打卡情况
  static async apiGetUserCheck(req, res, next) {
    try {
      const token = req.headers.authorization || req.headers.token;
      const openid = jwt.decode(token, SECRET);
      const user = await usersDAO.getUserByOpenId(openid);
      if (!user) {
        res.status(404).json({ error: "User Not Exist" });
        return;
      }
      const result = await calendarDAO.getCalendar(openid);
      console.log("result", result);
      res.json(result);
    } catch (e) {
      console.log(`apiGetUserCheck, ${e}`);
      res.status(500).json({ error: e });
    }
  }


  // 添加用户做题记录
  static async apiUpdateUserRecord(req, res, next) {
    try {
      const token = req.headers.authorization || req.headers.token;
      const openid = jwt.decode(token, SECRET);
      const user = await usersDAO.getUserByOpenId(openid);
      if (!user) {
        res.status(404).json({ error: "User Not Exist" });
        return;
      }
      const record = req.body || {};
      const data = {
        ...record,
        openid: openid,
        date: getCurrentDate(),
        datetime: new Date(),
      };
      console.log("data", data);
      const result = await RecordsDAO.addRecord(data);
      console.log("result", result);
      res.json(result);
    } catch (e) {
      console.log(`apiUpdateUserRecord, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  // 获取用户学习时间
  static async apiGetUserStudyTime(req, res, next) {
    try {
      const token = req.headers.authorization || req.headers.token;
      const openid = jwt.decode(token, SECRET);
      const user = await usersDAO.getUserByOpenId(openid);
      if (!user) {
        res.status(404).json({ error: "User Not Exist" });
        return;
      }
      const { date } = req.query || {};
      const result = await RecordsDAO.getStudyStatistic(openid, date);
      console.log("result", result);
      res.json(result);
    } catch (e) {
      console.log(`apiGetUserStudyTime, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  // 检查用户今日计划完成情况
  static async apiCheckUserPlan(req, res, next) {
    try {
      const token = req.headers.authorization || req.headers.token;
      const openid = jwt.decode(token, SECRET);
      const user = await usersDAO.getUserByOpenId(openid);
      if (!user) {
        res.status(404).json({ error: "User Not Exist" });
        return;
      }
      const result = await calendarDAO.checkUserPlan(openid);
      console.log("result", result);
      res.json(result);
    } catch (e) {
      console.log(`apiCheckUserPlan, ${e}`);
      res.status(500).json({ error: e });
    }
  }
}
