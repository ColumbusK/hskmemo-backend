import { getTimeStamp } from "../utils/tools.js";
// 无论在哪个地方，都把本地的时间转成中国时间传给后端
const localtDate = getTimeStamp();

const checkModel = {
  openid: "",
  number: 0,
  check_date: localtDate,
  datetime: new Date(),
}


export default checkModel;