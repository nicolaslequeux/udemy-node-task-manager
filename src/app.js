const express = require('express');

require('./db/mongoose');

const auth = require('./middleware/auth');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const User = require('./models/user');
const Task = require('./models/task');

const app = express();

//app.use(auth); // moved into router part to be selective % routes (not global)

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

module.exports = app;
