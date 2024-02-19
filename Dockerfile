# 使用 Node.js 官方镜像
FROM node:20

# 设置工作目录
WORKDIR /usr/src/app

# 将依赖文件拷贝到工作目录
COPY package*.json ./

# 安装依赖
RUN npm install

# 将应用程序文件拷贝到工作目录
COPY . .

# 暴露应用程序运行的端口
EXPOSE 3000

# 启动应用程序
CMD ["npm", "start"]
