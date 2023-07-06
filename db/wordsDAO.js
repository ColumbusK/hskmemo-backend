// Purpose: Data Access Object for words collection
import dotenv from "dotenv";
import mongodb from "mongodb";
import { ObjectId } from "mongodb";

dotenv.config();


let wordsDB;

class WordsDAO {
  static async injectDB(conn) {
    if (wordsDB) {
      return;
    }
    try {
      console.log();
      wordsDB = await conn.db(process.env.WORDS_NS);
      // console.log(words);
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in wordsDAO: ${e}`,
      );
    }
  };

  static async getWord(collec, word, wordid) {
    let query = {};
    if (word) {
      query = {
        _id: new ObjectId(wordid),
        word: { $eq: word }
      };
    }
    try {
      console.log("query", query);
      const words = wordsDB.collection(collec);
      const res = await words.findOne(query);
      // console.log("getWord", res);
      return res;
    } catch (e) {
      console.error(`getWord e: ${e}`);
      return null;
    }
  };

  static async getWords(collec, word) {
    let cursor;
    let query = {};
    console.log("filters", word);
    if (word) {
      query = { word: { $eq: word } };
    }
    try {
      const words = wordsDB.collection(collec);
      console.log("query", query);
      cursor = await words.find(query);
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`);
      return { wordsList: [], totalNumWords: 0 };
    }

    const displayCursor = cursor.limit(20);
    try {
      const wordsList = await displayCursor.toArray();
      // 统计文档数量
      const totalNumWords = await words.countDocuments();

      return { wordsList, totalNumWords };
    } catch (e) {
      console.error(
        `Unable to convert cursor to array or problem counting documents, ${e}`,
      );
      return { wordsList: [], totalNumWords: 0 };
    }
  };

  static async getDictSize(collec) {
    try {
      const words = wordsDB.collection(collec);
      const totalNumWords = await words.countDocuments();
      return totalNumWords;
    } catch (e) {
      console.error(`Unable to getDictSize, ${e}`);
      return 0;
    }
  };

  static async getWordById(id) {
    const query = { $match: { _id: new ObjectId(id) } };
    try {
      return await words.findOne(query);
    } catch (e) {
      console.error(`Something went wrong in getWordById: ${e}`);
      throw e;
    }
  };

  //  随机获取除word以外的n个单词数据
  static async getWordsByRandom(collec, word, n) {
    const query = { word: { $ne: word } };
    try {
      const words = wordsDB.collection(collec);
      const cursor = await words.aggregate([{ $match: query }, { $sample: { size: n } }]);
      const res = await cursor.toArray();
      return res;
    } catch (e) {
      console.error(`Something went wrong in getWordsByRandom: ${e}`);
      throw e;
    }
  };

  static async getWordsAndModify(collec, word, n) {
    const query = { word: { $ne: word } };
    try {
      const words = wordsDB.collection(collec);
      const res = await words.findAndModify(query, { $sample: { size: n } });
      return res;
    } catch (e) {
      console.error(`Something went wrong in getWordsByRandom: ${e}`);
      throw e;
    }
  };

  // 获取指定collection指定位置后n个文档
  static async getNWordsByPosition(collec, pos, n) {
    try {
      const words = wordsDB.collection(collec);
      const query = {};
      const projection = { _id: 1, word: 1 };
      const cursor = await words.find(query).project(projection).skip(pos).limit(n);
      const res = await cursor.toArray();
      return res;
    } catch (e) {
      console.error(`Something went wrong in getWordsByPosition: ${e}`);
      throw e;
    }
  }
}




export default WordsDAO;