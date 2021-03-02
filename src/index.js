const app = require('./app');

// const port = process.env.PORT || 3000;
const port = process.env.PORT; // use the env-cmd module for global variable management

app.listen(port, () => {
    console.log("Server listening on port", port);
})
