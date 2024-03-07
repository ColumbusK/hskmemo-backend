
// 解密函数
function decryptPhoneNumber(sessionKey, encryptedData, iv) {
  // 使用会话密钥（sessionKey）对加密数据进行解密
  console.log("sessionKey", sessionKey, "\nencryptedData", encryptedData, "\niv", iv);
  const sessionKeyBuffer = Buffer.from(sessionKey, 'base64');
  const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
  const ivBuffer = Buffer.from(iv, 'base64');
  const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, ivBuffer);
  decipher.setAutoPadding(true);
  let decoded = decipher.update(encryptedDataBuffer, 'binary', 'utf8');
  decoded += decipher.final('utf8');

  // 解密后的数据为 JSON 字符串，包含手机号码等信息
  const decryptedData = JSON.parse(decoded);
  console.log("decryptedData", decryptedData);

  // 提取手机号码

  return decryptedData;
}

export default decryptPhoneNumber;
