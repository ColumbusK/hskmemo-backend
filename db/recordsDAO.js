// Purpose: Data Access Object for words collection
import dotenv from "dotenv";
import mongodb from "mongodb";
import { formatSeconds, convertSecondsToMinutes, convertSecondsToHours } from "../utils/tools.js";

dotenv.config();
const ObjectId = mongodb.ObjectId;

let collection;
const COLLEC = "records";

class RecordsDAO {
  static async injectDB(conn) {
    if (collection) {
      return;
    }
    try {
      console.log();
      collection = await conn.db(process.env.WORDS_NS).collection(COLLEC);
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in wordsDAO: ${e}`,
      );
    }
  };

  // 添加做题记录
  static async addRecord(data) {
    try {
      const res = await collection.insertOne(data);
      console.log("addRecord", res);
      return res;
    } catch (e) {
      console.error(`addRecord e: ${e}`);
      return null;
    }
  }

  // 统计用户做题数据
  static async getStudyStatistic(openid, date) {
    const res = {
      totalTime: 0,
      todayTime: 0,
      totalWords: 0,
      todayWords: 0,
    }
    try {
      const pipeline1 = [
        { $match: { openid, date } }, // 匹配指定 openid 和日期的记录
        { $group: { _id: null, total: { $sum: '$time' } } } // 计算时间字段的累计总和
      ];
      const res1 = await collection.aggregate(pipeline1).toArray();
      console.log("getStudyTime", res1);
      if (res1.length > 0) {
        let seconds = parseInt(res1[0].total);
        res.todayTime = convertSecondsToMinutes(seconds);
      }
      const pipeline2 = [
        { $match: { openid } }, // 匹配指定 openid 的记录
        { $group: { _id: null, total: { $sum: '$time' } } } // 计算时间字段的累计总和
      ];
      const res2 = await collection.aggregate(pipeline2).toArray();
      console.log("getStudyTime", res2);
      if (res2.length > 0) {
        let seconds = parseInt(res2[0].total);
        res.totalTime = convertSecondsToHours(seconds);
      }
      // 今日学习词汇
      const pipeline3 = [
        { $match: { openid, date } }, // 匹配指定 openid 和日期的记录
        { $group: { _id: '$wordid' } }, // 计算时间字段的累计总和
        { $count: "total" }
      ];
      const res3 = await collection.aggregate(pipeline3).toArray();
      console.log("getStudyTime", res3);
      if (res3.length > 0) {
        res.todayWords = res3[0].total;
      }
      // 总共学习词汇
      const pipeline4 = [
        { $match: { openid } }, // 匹配指定 openid 的记录
        { $group: { _id: '$wordid' } }, // 计算时间字段的累计总和
        { $count: "total" }
      ];
      const res4 = await collection.aggregate(pipeline4).toArray();
      console.log("getStudyTime", res4);
      if (res4.length > 0) {
        res.totalWords = res4[0].total;
      }
      return res;
    } catch (e) {
      console.error(`getStudyTime e: ${e}`);
      return res;
    }
  }

  // 获取用户错词
  static async getWrongWords(openid) {
    console.log("getWrongWords", openid);
    try {
      const pipelines = [
        {
          $match: {
            openid: openid,
            collection: { $ne: null }
          },

        }, // 匹配指定 openid 的记录
        // 根据 wordid 分组，统计总数和正确数
        {
          $group: {
            _id: "$wordid",
            word: { $first: "$word" },
            collection: { $last: "$collection" },
            totalAttempts: { $sum: 1 },
            totalCorrect: { $sum: { $cond: [{ $eq: ["$result", 1] }, 1, 0] } }
          }
        },
        // 根据 collection 到 dicts 表中查询 dictName
        {
          $lookup: {
            from: "dictionaries",
            localField: "collection",
            foreignField: "collection",
            as: "dict"
          }
        },
        // 计算正确率
        {
          $project: {
            _id: 0,
            word: 1,
            wordid: "$_id",
            collection: 1,
            accuracy: {
              $cond: [
                { $eq: ["$totalAttempts", 0] },
                0,
                { $round: [{ $divide: ["$totalCorrect", "$totalAttempts"] }, 2] }
              ]
            },
            dict: { $arrayElemAt: ["$dict.dict", 0] }
          }
        },
        // 过滤正确率小于 0.9 的记录
        { $match: { accuracy: { $lt: 0.9 } } },
      ];
      const res = await collection.aggregate(pipelines).toArray();
      console.log("getWrongWords", res);
      return res;
    } catch (e) {
      console.error(`getWrongWords e: ${e}`);
      return [];
    }
  }
}


export default RecordsDAO;