import dotenv from "dotenv";
import mongodb from "mongodb";

dotenv.config();
const ObjectId = mongodb.ObjectID;

let learning_list;

class LearningDAO {
  static async injectDB(conn) {
    if (learning_list) {
      return;
    }
    try {
      console.log();
      learning_list = await conn.db(process.env.WORDS_NS).collection("learning_list");
      // console.log(users, typeof (users));
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in usersDAO: ${e}`,
      );
    }
  };

  // 插入学习列表
  static async insertLearingWords(learingList) {
    try {
      // 检查数据是否存在
      const existingDocs = await learning_list.find({
        $or: learingList.map(doc => ({ wordid: doc.wordid, openid: doc.openid }))
      }).toArray();
      console.log(`existingDocs: `, existingDocs);
      const existingWords = existingDocs.map(doc => doc.wordid);
      // 过滤掉已存在的数据
      const newDocuments = learingList.filter(doc => !existingWords.includes(doc.wordid));
      // 插入新的文档
      if (newDocuments.length > 0) {
        const result = await learning_list.insertMany(newDocuments);
        console.log(`Inserted ${result.insertedCount} documents`);
      } else {
        console.log('No new documents to insert');
      }
    } catch (e) {
      console.error(`Error inserting documents: ${error}`);
      return { error: e }
    }
  };

  static async updateDocumnet(filter, updatedFields) {
    try {
      const updateResponse = await learning_list.updateOne(
        filter,
        { $set: updatedFields },
      );
      return updateResponse;
    } catch (e) {
      console.error(`Unable to update document: ${e}`);
      return { error: e };
    }
  }

  static async getDocuments(filter) {
    try {
      const result = await learning_list.find(filter).toArray();
      return result;
    } catch (e) {
      console.error(`Unable to get document: ${e}`);
      return { error: e };
    }
  }

  static async getDocument(filter) {
    try {
      const result = await learning_list.findOne(filter);
      return result;
    } catch (e) {
      console.error(`Unable to get document: ${e}`);
      return { error: e };
    }
  }
}


export default LearningDAO