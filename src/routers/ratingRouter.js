const express = require('express')
const Rating = require('../models/rating')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()

router.get('/ratings/me', auth, async (req, res) => {
    try {
        const ratings = await Rating.find({ $or: [{ toID: req.user._id }, { fromID: req.user._id }] })
        if (!ratings) {
            return res.status(404).send()
        } 
        res.send(ratings)
    } catch (e) {
        res.status(500).send()
    }
})

//GET /ratings?fromID=ksnaasnjdsnasjd
//GET /ratings?toID=akamskamskamksmk
//GET /ratings?limit=10&page=1
router.get('/ratings', auth, async (req, res) => {
    const page = parseInt(req.query.page) || 0
    const limit = parseInt(req.query.limit) || 10
    const query = {}
    if (req.query.fromID) {
        query.fromID = req.query.fromID
    }
    if (req.query.toID) {
        query.toID = req.query.toID
    }
    try {
        const ratings = await Rating.find(query).sort({ updatedAt: -1 }).skip(page * limit).limit(limit).exec()
        if (!ratings) {
            return res.status(404).send()
        }
        const count = await Rating.countDocuments(query).exec()
        res.send({
            total: count,
            page: page,
            pageSize: ratings.length,
            limit,
            ratings
        })
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/ratings/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const rating = await Rating.findOne({ _id})
        if (!rating) {
            return res.status(404).send()
        }
        res.send(rating)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/ratings/:id', auth, async (req, res) => {
    const _id = req.params.id
    const allowedUpdates = ['rating', 'comment']
    const updates = Object.keys(req.body)

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try {
        const rating = await Rating.findOne({ 
            _id,
            fromID: req.user._id
        })
        if (!rating) {
            return res.status(404).send()
        }


        const user = await User.findById({ _id: rating.toID })
        let userRating = user.rating
        let totalRatings = user.totalRatings
        let sumRatings = userRating * totalRatings - rating.rating
        user.rating = sumRatings * 1.0 / (totalRatings - 1)
        user.totalRatings = totalRatings - 1

        updates.forEach((update) => rating[update] = req.body[update])

        userRating = user.rating
        totalRatings = user.totalRatings
        sumRatings = userRating * totalRatings + rating.rating
        user.rating = sumRatings * 1.0 / (totalRatings + 1)
        user.totalRatings = totalRatings + 1

        await rating.save()
        await user.save()
        res.send(rating)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/ratings', auth, async (req, res) => {
    const _id = req.body.toID
    if (!req.user._id.equals(req.body.fromID)) {
        return res.status(400).send()
    }

    if (req.user._id.equals(_id)) {
        return res.status(400).send()
    }
    try {
        const user = await User.findById({ _id })
        const rating = new Rating( req.body )
        const userRating = user.rating || 0
        const totalRatings = user.totalRatings || 0
        const sumRatings = userRating * totalRatings + rating.rating
        user.rating = sumRatings * 1.0 / (totalRatings + 1)
        user.totalRatings = totalRatings + 1
        await user.save()
        await rating.save()
        res.status(201).send(rating)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/ratings/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const rating = await Rating.findOneAndDelete({ _id, fromID: req.user._id })
        if (!rating) {
            return res.status(404).send();
        }
        res.send(rating)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router