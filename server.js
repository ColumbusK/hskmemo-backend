import express from "express";
import cors from "cors";

import indexRouter from "./api/index.route.js";
import wordsRouter from "./api/words.route.js";
import userRouter from "./api/user.route.js";
import practiceRouter from "./api/practice.route.js";
import dictsRouter from "./api/dicts.route.js";

import { verifyUsers } from "./middlewares/user.middleware.js";

const app = express();


app.use(cors());
app.use(express.json());


app.use('/', indexRouter);
app.use("/api/v1/user", userRouter);

// 自定义中间件
app.use(verifyUsers);

app.use("/api/v1/words", wordsRouter);
app.use("/api/v1/practice", practiceRouter);
app.use("/api/v1/dicts", dictsRouter);


const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: "route not found" });
}

app.use('*', unknownEndpoint);


export default app;