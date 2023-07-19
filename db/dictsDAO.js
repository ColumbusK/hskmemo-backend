// Purpose: Data Access Object for words collection
import dotenv from "dotenv";
import mongodb from "mongodb";

dotenv.config();
const ObjectId = mongodb.ObjectId;

let dictionariesDB;
const COLLEC = "dictionaries";

class DictsDAO {
  static async injectDB(conn) {
    if (dictionariesDB) {
      return;
    }
    try {
      console.log();
      dictionariesDB = await conn.db(process.env.WORDS_NS).collection(COLLEC);
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in wordsDAO: ${e}`,
      );
    }
  };

  // 获取dicts列表
  static async getDicts() {
    try {
      const res = await dictionariesDB.find({}).toArray();
      console.log("getDicts", res);
      return res;
    } catch (e) {
      console.error(`getDicts e: ${e}`);
      return null;
    }
  };

  // 根据collection获取dict
  static async getDictName(collection) {
    try {
      const res = await dictionariesDB.findOne({ collection: collection });
      console.log("getDict", res);
      return res;
    } catch (e) {
      console.error(`getDict e: ${e}`);
      return null;
    }
  }
}




export default DictsDAO;