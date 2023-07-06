import DictsDAO from "../db/dictsDAO.js";
import dotenv from "dotenv";
import jwt from "jwt-simple";

dotenv.config();

export default class DictsController {
  static async apiGetDicts(req, res, next) {
    try {
      let dictsData = await DictsDAO.getDicts();
      if (!dictsData) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(dictsData);
    } catch (e) {
      console.log(`api apiGetDicts, ${e}`);
      res.status(500).json({ error: e });
    }
  }
}