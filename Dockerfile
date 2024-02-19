# 使用 Node.js 官方镜像
FROM node:20

ENV NODE_ENV=production
ENV PORT=3002
ENV APPID=wx9c1c9892749269a6
ENV APPSECRET=695f07b9b575e9a83eae4361ea28bab8
ENV SECRET=columbusk
ENV WEAPP_DB_URI=mongodb+srv://columbusk:columbusk@cluster0.g8i2ghp.mongodb.net/?retryWrites=true&w=majority
ENV WORDS_NS=vocabulary

# 设置工作目录
WORKDIR /usr/src/app

# 将依赖文件拷贝到工作目录
COPY package*.json ./

# 安装依赖
RUN npm install

# 将应用程序文件拷贝到工作目录
COPY . .

# 暴露应用程序运行的端口
EXPOSE $PORT

# 启动应用程序
CMD ["npm", "start"]
