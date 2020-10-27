const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Route = require('../../src/models/route')
const Rating = require('../../src/models/rating')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Aditya Kashyap',
    email: 'aditya.kashyap1598@gmail.com',
    password: 'lalalala',
    age: 21,
    rating: 4.5,
    totalRatings: 2,
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.SECRET_JWT)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'Bhaskar Kashyap',
    email: 'bhaskar.kashyap1598@gmail.com',
    password: 'lalalala',
    age: 18,
    rating: 4,
    totalRatings: 1,
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.SECRET_JWT)
    }]
}

const userThreeId = new mongoose.Types.ObjectId()
const userThree = {
    _id: userThreeId,
    name: 'X',
    email: 'x.kashyap1598@gmail.com',
    password: 'lalalala',
    age: 18,
    rating: 0,
    totalRatings: 0,
    tokens: [{
        token: jwt.sign({ _id: userThreeId }, process.env.SECRET_JWT)
    }]
}

const routeOne = {
    _id: new mongoose.Types.ObjectId(),
    source: 'a',
    destination: 'b',
    num_passengers: 1,
    time_slot_from: '01:30am',
    time_slot_to: '05:00am',
    owner: userOneId
}

const routeTwo = {
    _id: new mongoose.Types.ObjectId(),
    source: 'a',
    destination: 'd',
    num_passengers: 3,
    time_slot_from: '01:30am',
    time_slot_to: '04:00am',
    owner: userOneId
}

const routeThree = {
    _id: new mongoose.Types.ObjectId(),
    source: 'x',
    destination: 'b',
    num_passengers: 2,
    time_slot_from: '01:30am',
    time_slot_to: '04:00am',
    owner: userTwoId
}

const ratingOne = {
    _id: new mongoose.Types.ObjectId(),
    toID: userOneId,
    fromID: userTwoId,
    rating: 5,
    comment: 'Great carpool buddy'
}

const ratingTwo = {
    _id: new mongoose.Types.ObjectId(),
    toID: userTwoId,
    fromID: userThreeId,
    rating: 4,
    comment: 'Great carpool buddy'
}

const ratingThree = {
    _id: new mongoose.Types.ObjectId(),
    toID: userOneId,
    fromID: userThreeId,
    rating: 4,
    comment: 'Great carpool buddy'
}

const setupDatabase = async () => {
    await User.deleteMany()
    await Route.deleteMany()
    await Rating.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new User(userThree).save()
    await new Rating(ratingOne).save()
    await new Rating(ratingTwo).save()
    await new Rating(ratingThree).save()
    await new Route(routeOne).save()
    await new Route(routeTwo).save()
    await new Route(routeThree).save()
}

const disconnectDatabase = async () => {
    await mongoose.disconnect()
}

afterAll(disconnectDatabase)

module.exports = {
    userOneId,
    userOne,
    userTwo,
    userTwoId,
    userThree,
    userThreeId,
    routeOne,
    routeTwo,
    routeThree,
    ratingOne,
    ratingTwo,
    ratingThree,
    setupDatabase,
    disconnectDatabase
}