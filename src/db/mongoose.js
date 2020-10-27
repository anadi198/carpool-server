const mongoose = require('mongoose')
const mongoURL = process.env.MONGO_URL

mongoose.connect(mongoURL, {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true
})

module.exports = mongoose
