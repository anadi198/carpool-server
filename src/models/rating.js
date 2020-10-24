const mongoose = require('mongoose')

const ratingSchema = mongoose.Schema({
    fromID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        trim: true
    },
    toID: {
        type: String,
        required: true,
        trim: true
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
    timestamps: true
})

const Rating = mongoose.model('Rating', ratingSchema)

module.exports = Rating
