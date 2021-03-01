const express = require('express');

require('./db/mongoose');

const auth = require('./middleware/auth');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const User = require('./models/user');
const Task = require('./models/task');

const app = express();
// const port = process.env.PORT || 3000;
const port = process.env.PORT; // use the env-cmd module for global variable management

//app.use(auth); // moved into router part to be selective % routes (not global)

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log("Server listening on port", port);
})
