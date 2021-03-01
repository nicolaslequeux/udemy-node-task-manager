const mongoose = require('mongoose')

mongoose.connect(process.env.MONGOD_API_KEY, {
    useNewUrlParser: true,
    // useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})
