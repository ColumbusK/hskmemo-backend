import dotenv from "dotenv";
import jwt from "jwt-simple";
import { ObjectId } from "mongodb";

import WordsDAO from "../db/wordsDAO.js";
import UsersDAO from "../db/usersDAO.js";
import LearningDAO from "../db/learningDAO.js";
import CollectionsDAO from "../db/collectionsDAO.js";
import RecordsDAO from "../db/recordsDAO.js";

import { shuffleArray, getCurrentDate, getTimeStamp } from "../utils/tools.js";
import learningModel from "../models/learingList.js";
import { memoTime, calAccuracy } from "../utils/algorithm.js";


dotenv.config();

// 为每个单词匹配选项、正确答案、收藏状态等
async function wordsMatcher(openid, wordList, dict) {
  console.log(`wordsMatcher, dict`, dict);
  let practiceList = [];
  try {
    for (let i = 0; i < wordList.length; i++) {
      let word = wordList[i].word;
      let wordid = wordList[i].wordid;
      const wordData = await WordsDAO.getWord(dict, word, wordid);
      if (!wordData) {
        continue;
      }
      const collected = await CollectionsDAO.checkCollectedWord({ wordId: wordData._id, openid: openid });
      let randomWords = await WordsDAO.getWordsByRandom(dict, word, 3);
      const options = shuffleArray([...randomWords.map((item) => item.explaination), wordData.explaination]);
      const practiceData = {
        wordid: wordData._id,
        word: wordData.word,
        pinyin: wordData.pinyin,
        ens: wordData.ens,
        explaination: wordData.explaination,
        options: options,
        correct: wordData.explaination,
        collected: collected,
        sound: null,
        dict: dict,
      };
      practiceList.push(practiceData);
    }
    return practiceList;
  } catch (e) {
    console.log(`wordsMatcher, ${e}`);
  }
};

// 生成学习列表
async function generateLearningList(user, wordList) {
  let learningList = [];
  // 获取用户信息, 当前词典，词典的学习次数，
  const current_dict = user.current_dict;
  console.log(`用户当前词典：${current_dict}`);
  const openid = user.openid;
  wordList.forEach((word) => {
    const learningWord = {
      ...learningModel,
      openid: openid,
      wordid: word._id,
      word: word.word,
      dict: current_dict,
      next: user.dict_progress[current_dict].times + 1,
    }
    learningList.push(learningWord);
  });
  // console.log(`generateLearningList, learningList: $`, learningList);
  return learningList;
}

export default class PracticeController {
  static async apiGetPractice(req, res, next) {
    try {
      let word = req.params.word || {};
      console.log(`apiGetPractice, word: ${word}`);
      const token = req.headers.authorization;
      // console.log(req.headers);
      // 对token进行解密获取其中的openid
      const openid = jwt.decode(token, process.env.SECRET);
      let randomWords = await WordsDAO.getWordsByRandom(word, 3);
      // console.log("randomWords", randomWords);
      const wordData = await WordsDAO.getWord(word);
      // console.log("wordData", wordData);
      const options = shuffleArray([...randomWords.map((item) => item.explaination), wordData.explaination]);
      const practiceData = {
        word: wordData.word,
        pinyin: wordData.pinyin,
        ens: wordData.ens,
        explaination: wordData.explaination,
        options: options,
        correct: wordData.explaination,
        sound: null,
      };
      console.log("practiceData", practiceData);
      if (!practiceData) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(practiceData);
    } catch (e) {
      console.log(`apiGetPractice, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  static async apiGetPracticeList(req, res, next) {
    try {
      let num = parseInt(req.params.num) || 10;
      let practiceList = [];
      console.log(`apiGetPracticeList, num: ${num}`);
      const token = req.headers.authorization;
      const openid = jwt.decode(token, process.env.SECRET);
      const user = await UsersDAO.getUserByOpenId(openid);
      const current_dict = user.current_dict;
      // 对token进行解密获取其中的openid
      const word = "版";
      let wordList = await WordsDAO.getWordsByRandom(current_dict, word, num);
      practiceList = await wordsMatcher(wordList);
      // console.log("practiceList", practiceList);
      if (!practiceList) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(practiceList);
    } catch (e) {
      console.log(`apiGetPracticeList, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  // 今日复现单词接口
  static async apiGetReviewList(req, res, next) {
    try {
      let practiceList = [];
      // 获取用户信息
      const token = req.headers.authorization;
      const openid = jwt.decode(token, process.env.SECRET);
      const user = await UsersDAO.getUserByOpenId(openid);
      const current_dict = user.current_dict;
      console.log(`用户当前词典：${current_dict}`);
      console.log(`apiGetReviewList, user: `, user, current_dict);
      if (!user) {
        res.status(404).json({ error: "User Not found" });
        return;
      }
      // 获取用户今日需要复现的单词
      const _filter = { openid: openid, dict: current_dict, next: user.dict_progress[current_dict].times };
      const learningWords = await LearningDAO.getDocuments(_filter);
      const pratciceList = await wordsMatcher(openid, learningWords, current_dict);
      res.json(pratciceList);
    } catch (e) {
      console.log(`apiGetReviewList, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  static async apiGetPracticeListByUser(req, res, next) {
    try {
      let practiceList = [];
      // 获取用户信息
      const token = req.headers.authorization;
      const openid = jwt.decode(token, process.env.SECRET);
      const user = await UsersDAO.getUserByOpenId(openid);
      const current_dict = user.current_dict;
      console.log(`用户当前词典：${current_dict}`);
      console.log(`apiGetPracticeListByUser, user: `, user, current_dict);
      if (!user) {
        res.status(404).json({ error: "User Not found" });
        return;
      }
      if (user.dict_progress[current_dict].load_time !== getCurrentDate()) {
        // 获取相关用户信息
        const newWordNum = user.day_new;
        console.log(`用户今日新词数：${newWordNum}`);
        const position = user.dict_progress[current_dict].count;
        console.log(`用户当前词典已学：${position}`);
        const newWordList = await WordsDAO.getNWordsByPosition(current_dict, position, newWordNum);
        console.log(`用户今日新词：`, newWordList);
        // 在学习列表为用户添加新词
        const learningList = await generateLearningList(user, newWordList);
        console.log(`用户今日学习列表：`, learningList);
        // 存储学习列表到数据库
        const result = await LearningDAO.insertLearingWords(learningList);
        console.log(`用户今日学习列表存储结果：`, result);
        // 更新用户信息
        const filter = { openid: openid };
        const updatedFields = {
          dict_progress: {
            ...user.dict_progress,
            [current_dict]: {
              ...user.dict_progress[current_dict],
              count: user.dict_progress[current_dict].count + newWordNum,
              load_time: getCurrentDate(),
            }
          },
        };
        const updateResponse = await UsersDAO.updateDocumnet(filter, updatedFields);
        console.log(`用户信息更新结果：`, updateResponse);
      }
      // 从学习列表中获取今日学习单词
      const _filter = { openid: openid, dict: current_dict, next: user.dict_progress[current_dict].times + 1 };
      const learningWords = await LearningDAO.getDocuments(_filter);
      const pratciceList = await wordsMatcher(openid, learningWords, current_dict);
      res.json(pratciceList);
    } catch (e) {
      console.log(`apiGetPracticeListByUser, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  // 增强练习接口
  static async apiGetEnhancePractices(req, res, next) {
    try {
      let practiceList = [];
      // 获取用户信息
      const token = req.headers.authorization;
      const openid = jwt.decode(token, process.env.SECRET);
      const user = await UsersDAO.getUserByOpenId(openid);
      const current_dict = user.current_dict;
      console.log(`用户当前词典：${current_dict}`);
      console.log(`apiGetEnhancePractices, user: `, user, current_dict);
      if (!user) {
        res.status(404).json({ error: "User Not found" });
        return;
      }
      // 获取用户需要增强练习的错词
      const wrongWords = await RecordsDAO.getWrongWords(openid);
      console.log(`增强练习用户错词：`, wrongWords);
      // 错词加工练习题目
      practiceList = await wordsMatcher(openid, wrongWords, current_dict);
      return res.json(practiceList);
    } catch (e) {
      console.log(`apiGetEnhancePractices, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  // 答题反馈修改学习列表
  static async apiPostPracticeFeedback(req, res, next) {
    try {
      const wordid = req.params.wordid || {};
      const result = req.body.result || 0;
      const token = req.headers.authorization;
      // 对token进行解密获取其中的openid
      const openid = jwt.decode(token, process.env.SECRET);
      const user = await UsersDAO.getUserByOpenId(openid);
      const current_dict = user.current_dict;
      const dict_times = user.dict_progress[current_dict].times;
      console.log(`用户当前词典：${current_dict}`);
      console.log(`apiPostPracticeFeedback, wordid: ${wordid}`);
      const filter = { openid: openid, wordid: new ObjectId(wordid), dict: current_dict };
      const learningWord = await LearningDAO.getDocument(filter);
      const accuracy = calAccuracy(learningWord.records);
      let learnTimes = learningWord.times + 1;
      let nextTime = dict_times + memoTime[learningWord.times];
      if (result === 0) {
        nextTime = dict_times + 1;
        learnTimes = 0;
      }
      const updatedFields = {
        ...learningWord,
        next: nextTime,
        times: learnTimes,
        accuracy: accuracy,
        records: [...learningWord.records, result],
        last_time: getTimeStamp(),
      };
      const updateResponse = await LearningDAO.updateDocumnet(filter, updatedFields);
      console.log(`用户信息更新结果：`, updateResponse);
      res.json(updateResponse);
    } catch (e) {
      console.log(`apiPostPracticeFeedback, ${e}`);
      res.status(500).json({ error: e });
    }
  }
}
