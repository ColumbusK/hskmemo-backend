import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

// 无论在哪个地方，都把本地的时间转成中国时间传给后端
function getTimeStamp() {
  const targetDate = dayjs(new Date()).tz("Asia/Shanghai").format('YYYY-MM-DD HH:mm:ss')
  return targetDate;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}


function getCurrentDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}


// 秒转换成时分秒
function formatSeconds(seconds) {
  seconds = parseInt(seconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  return formattedTime;
}

function convertSecondsToMinutes(seconds) {
  seconds = parseInt(seconds);
  const minutes = Math.round(seconds / 60);
  return minutes;
}

// convertSecondsToHours
function convertSecondsToHours(seconds) {
  seconds = parseInt(seconds);
  const hours = Math.ceil(seconds / 3600);
  return hours;
}


export { shuffleArray, getCurrentDate, getTimeStamp, formatSeconds, convertSecondsToMinutes, convertSecondsToHours }