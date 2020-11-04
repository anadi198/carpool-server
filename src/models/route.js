const mongoose = require('mongoose')

const routeSchema = mongoose.Schema({
    createdAt: Number,
    updatedAt: Number,
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
        lowercase: true,
        validate(value) {
            if (value.length !== 7 || !value.match(/(((1[0-2])|(0[1-9])):([0-5][0-9])([ap][m]))/)) {
                throw new Error('Time must be of the format HH:MM (12 hour) with mandatory meridiems')
            }  
        }
    },
    time_slot_to: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (value.length !== 7 || !value.match(/(((1[0-2])|(0[1-9])):([0-5][0-9])([ap][m]))/)) {
                throw new Error('Time must be of the format HH:MM (12 hour) with mandatory meridiems')
            }  
        }
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    passengers: [{
        passengerID: {
            type: mongoose.Types.ObjectId
        }
    }],
    advertise : {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: { 
        currentTime: () => Math.floor(Date.now() / 1000)
    }
})

const Route = mongoose.model('Route', routeSchema)

module.exports = Route
