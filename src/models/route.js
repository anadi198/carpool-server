const mongoose = require('mongoose')
const validator = require('validator')

const routeSchema = mongoose.Schema({
    source: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    destination: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    num_passengers: {
        type: Number,
        default: 1,
        validate(value) {
            if(value<=0) {
                throw new Error('Number of passengers has to be >=1')
            }
        }
    },
    time_slot_from: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    time_slot_to: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

const Route = mongoose.model('Route', routeSchema)

module.exports = Route
