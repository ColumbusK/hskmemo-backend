// Purpose: Data Access Object for words collection
import dotenv from "dotenv";
import mongodb from "mongodb";

dotenv.config();
const ObjectId = mongodb.ObjectId;

let resourcesDB;
const DB = "yunfan_resources"
const COLLEC = "simple_dict";

class ResourcesDAO {
  static async injectDB(conn) {
    if (resourcesDB) {
      return;
    }
    try {
      console.log();
      resourcesDB = await conn.db(DB)
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in wordsDAO: ${e}`,
      );
    }
  };

  // simple_dict查词
  static async simpleDictSearch(word) {
    try {
      const simple_dict = await resourcesDB.collection("simple_dict");
      const res = await simple_dict.findOne({ word: word });
      console.log("simpleDictSearch", res);
      return res;
    } catch (e) {
      console.error(`simpleDictSearch e: ${e}`);
      return null;
    }
  };
  // 根据collection获取dict
}




export default ResourcesDAO;
