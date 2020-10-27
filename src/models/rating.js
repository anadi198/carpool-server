const mongoose = require('mongoose')

const ratingSchema = mongoose.Schema({
    createdAt: Number,
    updatedAt: Number,
    fromID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    toID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        validate(value) {
            if(value<=0) {
                throw new Error('Rating has to be >=0')
            }
        }
    },
    comment: {
        type: String,
        default: 'No comment given.'
    }
}, {
    timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }
})

const Rating = mongoose.model('Rating', ratingSchema)

module.exports = Rating
