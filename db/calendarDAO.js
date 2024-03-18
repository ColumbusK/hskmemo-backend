// Purpose: Data Access Object for words collection
import dotenv from "dotenv";
import mongodb from "mongodb";

import { getCurrentDate } from "../utils/tools.js";

dotenv.config();
const ObjectId = mongodb.ObjectId;

let collection;
const COLLEC = "calendars";

class calendarDAO {
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

  // 添加打卡记录
  static async addCalendar(data) {
    try {
      const res = await collection.insertOne(data);
      console.log("addCalendar - Document inserted:", res);
      return res; // 返回插入的文档
    } catch (e) {
      console.error("addCalendar - Error:", e.message);
      return null; // 返回 null 表示插入失败
    }
  }


  // 获取本月打卡记录
  static async getCalendar(openid) {
    // 获取本月月份
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    let month = currentDate.getMonth() + 1;
    month = month < 10 ? `0${month}` : month;
    const reg = `^${year}-${month}`
    console.log("reg", reg);
    // 查询管道
    const pipleline = [
      {
        "$match": {
          "openid": openid,
          "check_date": {
            "$regex": reg
          }
        }
      },
      {
        "$project": {
          "days": {
            "$dayOfMonth": {
              "$dateFromString": {
                "dateString": "$check_date",
                "format": "%Y-%m-%d %H:%M:%S"
              }
            }
          }
        }
      },
      {
        "$project": {
          "_id": 0,
          "days": 1
        }
      }
    ];
    try {
      const res = await collection.aggregate(pipleline).toArray();
      console.log("getCalendar", res);
      return res;
    } catch (e) {
      console.error(`getCalendar e: ${e}`);
      return null;
    }
  }

  // 检查今日打卡情况 checkUserPlan
  static async checkUserPlan(openid) {
    // 获取今日日期
    const currentDate = getCurrentDate();
    const reg = `^${currentDate}`
    try {
      const filter = {
        openid: openid,
        "check_date": {
          "$regex": reg
        }
      };
      const res = await collection.findOne(filter);
      console.log("checkUserPlan", res);
      if (res && res.check_date.includes(currentDate)) {
        console.log("checkUserPlan", res);
        return res;
      } else {
        return null;
      }
    } catch (e) {
      console.error(`checkUserPlan e: ${e}`);
      return null;
    }
  }

}




export default calendarDAO;
