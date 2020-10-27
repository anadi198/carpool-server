const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOne, userOneId, setupDatabase, userTwo, routeOne} = require('./fixtures/db')
const Route = require('../src/models/route')

beforeEach(setupDatabase)

test('Should create a route for user', async () => {
    const response = await request(app)
        .post('/routes')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            source: 'Mumbai',
            destination: 'Delhi',
            time_slot_from: '01:00pm',
            time_slot_to: '01:30pm'
        })
        .expect(201)
    const route = await Route.findById(response.body._id)
    expect(route).not.toBeNull()
    expect(route).toMatchObject({
        source: 'mumbai',
        num_passengers: 1,
        owner: userOne._id
    })
})

test('Should return correct number of routes for GET /routes/me', async () => {
    const response = await request(app)
        .get('/routes/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    // Assert that the number of routes returned is equal to two
    expect(response.body.length).toEqual(2)
})

test('Should fetch user route by id', async () => {
    const response = await request(app)
        .get(`/routes/${routeOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    // Assert that correct route was returned
    const route = await Route.findById(response.body._id)
    expect(route).toMatchObject(routeOne)
})

test('Should return correct number of routes for given source city', async () => {
    const response = await request(app)
        .get('/routes?from=a')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    //Assert that the number of routes with source equal to a is 2
    expect(response.body.total).toEqual(2)
})

test('Should return correct number of routes for given destination city', async () => {
    const response = await request(app)
        .get('/routes?to=b')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    //Assert that the number of routes with destination equal to b is 2
    expect(response.body.total).toEqual(2)
})

test('Should return correct number of routes for given time slot', async () => {
    const response = await request(app)
        .get('/routes?timeFrom=01:30am&timeTo=04:00am')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    //Assert that the number of routes with time slot 01:30am-04:00am is two
    expect(response.body.total).toEqual(2)
})

test('Should return correct number of routes for given start time slot and source', async () => {
    const response = await request(app)
        .get('/routes?from=a&timeTo=04:00am')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    //Assert that the number of routes with time slot *-04:00am and source a is one
    expect(response.body.total).toEqual(1)
})

test('Should return correct number of routes for given start time slot', async () => {
    const response = await request(app)
        .get('/routes?timeFrom=01:30am')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    //Assert that the number of routes with time slot 01:30am-* is three
    expect(response.body.total).toEqual(3)
})

test('Should return routes in descending order according to updatedAt', async () => {
    const response = await request(app)
        .get('/routes')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    //Assert that the first route was the latest to be modified
    expect(response.body.routes[0].updatedAt).toBeGreaterThanOrEqual(response.body.routes[1].updatedAt)
})

test("Should not let a user delete some other user's route", async () => {
    await request(app)
    .delete(`/routes/${routeOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)
    // Assert that the route still remains in the database 
    const route = await Route.findById(routeOne._id)
    expect(route._id).not.toBeNull()
})

test('Should not create a route with invalid source', async () => {
    await request(app)
        .post('/routes')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            source: '',
            destination: 'Delhi',
            time_slot_from: '01:00pm',
            time_slot_to: '01:30pm'
        })
        .expect(400)
})

test('Should not create a route with invalid destination', async () => {
    await request(app)
        .post('/routes')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            source: 'Mumbai',
            destination: '',
            time_slot_from: '01:00pm',
            time_slot_to: '01:30pm'
        })
        .expect(400)
})

test('Should not create a route with invalid start time for time slot', async () => {
    await request(app)
        .post('/routes')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            source: 'Mumbai',
            destination: 'Delhi',
            time_slot_from: '13:00pm',
            time_slot_to: '01:30pm'
        })
        .expect(400)
})

test('Should not create a route with invalid end time for time slot', async () => {
    await request(app)
        .post('/routes')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            source: 'Mumbai',
            destination: 'Delhi',
            time_slot_from: '01:00pm',
            time_slot_to: '01:90pm'
        })
        .expect(400)
})

test('Should update a route', async () => {
    await request(app)
        .patch(`/routes/${routeOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            source: 'Mumbai',
            destination: 'Pune',
            time_slot_from: '01:00pm',
            time_slot_to: '01:30pm'
        })
        .expect(200)
})

test('Should not update a route with invalid time slot', async () => {
    await request(app)
        .patch(`/routes/${routeOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            source: 'Mumbai',
            destination: 'Delhi',
            time_slot_from: '01:00pm',
            time_slot_to: '01:90pm'
        })
        .expect(400)
})

test('Should not update a route with invalid source', async () => {
    await request(app)
        .patch(`/routes/${routeOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            source: '',
            destination: 'Delhi',
            time_slot_from: '01:00pm',
            time_slot_to: '01:30pm'
        })
        .expect(400)
})

test('Should not update a route with invalid destination', async () => {
    await request(app)
        .patch(`/routes/${routeOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            source: 'Mumbai',
            destination: '',
            time_slot_from: '01:00pm',
            time_slot_to: '01:30pm'
        })
        .expect(400)
})

test("Should not update other user's route", async () => {
    await request(app)
        .patch(`/routes/${routeOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            source: 'Mumbai',
            destination: 'Delhi',
            time_slot_from: '01:00pm',
            time_slot_to: '02:30pm'
        })
        .expect(404)
})

test('Should delete user route', async () => {
    await request(app)
        .delete(`/routes/${routeOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    // Assert that the route doesn't exist anymore in the db
    const route = await Route.findById(routeOne._id)
    expect(route).toBeNull()
})

test("Should not delete other user's route", async () => {
    await request(app)
        .delete(`/routes/${routeOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
    // Assert that the route still exists in the db
    const route = await Route.findById(routeOne._id)
    expect(route).not.toBeNull()
})

test('Should not delete user route if unauthenticated', async () => {
    await request(app)
        .delete(`/routes/${routeOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}xx`)
        .send()
        .expect(401)
    // Assert that the route still exists in the db
    const route = await Route.findById(routeOne._id)
    expect(route).not.toBeNull()
})

test('Should return second route on page 2 when limit is 1', async () => {
    const response1 = await request(app)
        .get('/routes?limit=1&page=2')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    //Assert that the route on page 2 with limit 1 is the same as the second route on page 1 with limit 10
    const response2 = await request(app)
        .get('/routes')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response1.body.routes[0]._id).toEqual(response2.body.routes[1]._id)
})
