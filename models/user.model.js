import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

// 无论在哪个地方，都把本地的时间转成中国时间传给后端
const targetDate = dayjs(new Date()).tz("Asia/Shanghai").format('YYYY-MM-DD HH:mm:ss')

const userModel = {
  openid: "",
  username: "",
  phone_number: "",
  day_new: 20,
  day_review: 10,
  register_date: targetDate,
  total_time: "",
  today_time: "",
  dicts: ["hsk5"],
  current_dict: "hsk5",
  dict_progress: {
    hsk5: {
      times: 0,
      count: 0,
      load_time: ""
    }
  }
}


export default userModel;