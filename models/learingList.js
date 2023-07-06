import { getTimeStamp } from "../utils/tools.js";
// 无论在哪个地方，都把本地的时间转成中国时间传给后端
const targetDate = getTimeStamp();

const learningModel = {
  openid: "",
  wordid: null,
  word: "",
  dict: "hsk5",
  times: 0,
  next: 0,
  degree: 0,
  accuracy: 0,
  records: [],
  last_time: targetDate,
  start_date: targetDate,
}


export default learningModel;