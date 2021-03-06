const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Route = require('./route')

const userSchema = mongoose.Schema({
    createdAt: Number,
    updatedAt: Number,
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value<0) {
                throw new Error('Age must be a positive number!')
            }
        }
    },
    verified: {
        type: Boolean,
        default: false
    },
    phone: {
        type: String,
        trim: true,
        validate(value) {
            if (!validator.isMobilePhone(value)) {
                throw new Error('Please enter a valid phone number.')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    },
    rating: {
        type: Number,
        required: true,
        default: 0
    },
    totalRatings: {
        type: Number,
        required: true,
        default: 0
    },
    addedUsers: [{
        type: mongoose.Types.ObjectId
    }]
}, {
    timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }
})

const secret = process.env.SECRET_JWT

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, secret)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

// Hash the plaintext password before saving
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

// Delete user's routes when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Route.deleteMany({ owner: user._id })
    next()
})

userSchema.virtual('routes', {
    ref: 'Route',
    localField: '_id',
    foreignField: 'owner',
})

const User = mongoose.model('User', userSchema)

module.exports = User
