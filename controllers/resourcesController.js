import ResourcesDAO from "../db/resourcesDAO.js";
import dotenv from "dotenv";

dotenv.config();

export default class ResourcesController {
  // static async apiGetDicts(req, res, next) {
  //   try {
  //     let dictsData = await DictsDAO.getDicts();
  //     if (!dictsData) {
  //       res.status(404).json({ error: "Not found" });
  //       return;
  //     }
  //     res.json(dictsData);
  //   } catch (e) {
  //     console.log(`api apiGetDicts, ${e}`);
  //     res.status(500).json({ error: e });
  //   }
  // }

  static async apiSimpleDictSearch(req, res, next) {
    try {
      const word = req.query.word;
      console.log("apiSimpleDictSearch", word);
      let wordData = await ResourcesDAO.simpleDictSearch(word);
      if (!wordData) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(wordData);
    } catch (e) {
      console.log(`api apiSimpleDictSearch, ${e}`);
      res.status(500).json({ error: e });
    }
  }
}
