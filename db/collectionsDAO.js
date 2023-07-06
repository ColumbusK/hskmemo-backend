// Purpose: Data Access Object for words collection
import dotenv from "dotenv";
import mongodb from "mongodb";

dotenv.config();
const ObjectId = mongodb.ObjectId;

let collection;
const COLLEC = "collections";

class CollectionsDAO {
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

  // 获取全部collections
  static async getCollections() {
    try {
      const res = await collection.find({}).toArray();
      console.log("getCollections", res);
      return res;
    } catch (e) {
      console.error(`getCollections e: ${e}`);
      return null;
    }
  }


  // 获取用户收藏的单词
  static async getUserCollectedWords(openid) {
    try {
      const res = await collection.find({ openid: openid }).toArray();
      console.log("getUserCollectedWords", res);
      return res;
    } catch (e) {
      console.error(`getUserCollectedWords e: ${e}`);
      return null;
    }
  }

  // 更新收藏单词，如果已经收藏则取消收藏，如果没有收藏则收藏
  static async updateCollectWord(data) {
    try {
      const { wordId, openid } = data;
      const res = await collection.findOne({ openid: openid, wordId: wordId });
      console.log("updateCollectWord", res);
      if (res) {
        // 取消收藏
        const res = await collection.deleteOne({ openid: openid, wordId: wordId });
        console.log("updateCollectWord", res);
        return { deleted: 0 };
      } else {
        // 收藏
        const res = await collection.insertOne(data);
        console.log("updateCollectWord", res);
        return { inserted: 1 };
      }
    } catch (e) {
      console.error(`updateCollectWord e: ${e}`);
      return null;
    }
  }

  // 检查单词是否已经收藏
  static async checkCollectedWord(data) {
    try {
      const { wordId, openid } = data;
      const res = await collection.findOne({ openid: openid, wordId: wordId });
      console.log("checkCollectedWord", res);
      if (res) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.error(`checkCollectedWord e: ${e}`);
      return null;
    }
  }
}




export default CollectionsDAO;