const express = require('express')
const Route = require('../models/route')
const auth = require('../middleware/auth')
const router = new express.Router()

router.get('/routes/me', auth, async (req, res) => {
    try {
        await req.user.populate('routes').execPopulate()
        res.send(req.user.routes)
    } catch (e) {
        res.status(500).send()
    }
})

//GET /routes?from=Kolkata&timeFrom=01:30pm&timeTo=02:30pm
//GET /routes?from=Kolkata&to=Mumbai
//GET /routes?from=Kolkata
//GET /routes?to=Mumbai
//GET /routes?limit=10&page=1
router.get('/routes', auth, async (req, res) => {
    const page = parseInt(req.query.page) || 0
    const limit = parseInt(req.query.limit) || 10
    const query = {}
    if (req.query.from) {
        query.source = req.query.from
    }
    if (req.query.to) {
        query.destination = req.query.to
    }
    if (req.query.timeFrom) {
        query.time_slot_from = req.query.timeFrom
    }
    if (req.query.timeTo) {
        query.time_slot_to = req.query.timeTo
    }
    try {
        const routes = await Route.find(query).sort({ updatedAt: -1 }).skip(page * limit).limit(limit).exec()
        if (!routes) {
            return res.status(404).send()
        }
        const count = await Route.countDocuments(query).exec()
        res.send({
            total: count,
            page: page,
            pageSize: routes.length,
            limit,
            routes
        })
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/routes/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const route = await Route.findOne({ _id })
        if (!route) {
            return res.status(404).send()
        }
        res.send(route)
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/routes', auth, async (req, res) => {
    const route = new Route({ 
        ...req.body,
        owner: req.user._id
     })
    try {
        await route.save()
        res.status(201).send(route)
    } catch (e) {
        res.status(400).send(e)
    }
})


router.post('/routes/passenger', auth, async (req, res) => {
    try {
        const passenger = await User.findById(req.body.passenger)
        if (!passenger) {
            return res.status(404).send('Passenger not found in database')
        }

        const route = await Route.findById(req.body.route)
        if (!route) {
            return res.status(404).send('Invalid route')
        }

        if (!route.owner === req.user._id) {
            return res.status(401).send()
        }

        if (passenger._id === req.user._id) {
            return res.status(400).send('Why are you trying to add yourself to your route?')
        }

        route.passengers.concat(passenger._id)
        route.num_passengers++
        await route.save()

        res.send()
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/routes/advertise', auth, async (req, res) => {
    try {
        const advertise = req.body.advertise
        if (!advertise) {
            return res.status(400).send()
        }

        const route = await Route.findById(req.body.route)
        if (!route) {
            return res.status(404).send('Invalid route')
        }

        if (!route.owner === req.user._id) {
            return res.status(401).send()
        }

        if (typeof advertise !== 'boolean') {
            return res.status(400).send(`advertise field has to be of type 'boolean'`)
        }

        route.advertise = advertise
        await route.save()

        res.send()
    } catch (e) {
        res.status(400).send()
    }
})

router.patch('/routes/:id', auth, async (req, res) => {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['time_slot_from', 'time_slot_to', 'source', 'destination', 'num_passengers', 'passengers', 'advertise']

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const route = await Route.findOne({ _id, owner: req.user._id })
        
        if (!route) {
            return res.status(404).send()
        }

        updates.forEach((update) => {
            if (update === 'passengers') {
                route.passengers.concat(req.body[update])
                route.num_passengers += req.body[update].length
            }
            else {
                route[update] = req.body[update]
            }
        })

        if (!route.passengers.length === route.num_passengers) {
            return res.status(400).send()
        }

        await route.save()
        res.send(route)

    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/routes/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const route = await Route.findOneAndDelete({ _id, owner: req.user._id })
        if (!route) {
            return res.status(404).send();
        }
        res.send(route)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router