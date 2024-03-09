
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // 如果是文件写入失败导致的错误，返回500 Internal Server Error
  if (err.code === 'ENOENT') {
    return res.status(500).send('Internal Server Error: Failed to write file.');
  }

  // 处理其他错误，返回适当的响应
  res.status(500).send('Internal Server Error');
}


export { errorHandler };
