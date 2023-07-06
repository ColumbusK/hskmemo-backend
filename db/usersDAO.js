import dotenv from "dotenv";
import mongodb from "mongodb";

dotenv.config();
const ObjectId = mongodb.ObjectID;

let users;

class UsersDAO {
  static async injectDB(conn) {
    if (users) {
      return;
    }
    try {
      console.log();
      users = await conn.db(process.env.WORDS_NS).collection("users");
      // console.log(users, typeof (users));
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in usersDAO: ${e}`,
      );
    }
  };

  // 新建用户
  static async createUser(user) {
    if (!user) {
      console.log(`Unable to create a user, user info is null`);
      return
    }
    try {
      return await users.insertOne(user);
    } catch (e) {
      console.error(
        `Unable to create a user handle in usersDAO: ${e}`,
      );
      return { error: e }
    }
  };

  // 根据 openId 获取用户
  static async getUserByOpenId(openid) {
    try {
      const query = { openid: openid };
      const user = await users.findOne(query);
      return user;
    } catch (e) {
      console.error(`Unable to get user, ${e}`);
      return false;
    }
  }

  static async updateDocumnet(filter, updatedFields) {
    try {
      const updateResponse = await users.updateOne(
        filter,
        { $set: updatedFields },
      );
      return updateResponse;
    } catch (e) {
      console.error(`Unable to update document: ${e}`);
      return { error: e };
    }
  }
}


export default UsersDAO