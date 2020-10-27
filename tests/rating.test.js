const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const Rating = require('../src/models/rating')
const {userOne, userOneId, userTwo, userTwoId, userThreeId, setupDatabase, ratingOne, ratingTwo, ratingThree} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create a rating for user', async () => {
    const response = await request(app)
        .post('/ratings')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            fromID: userOneId,
            toID: userTwoId,
            rating: 3
        })
        .expect(201)
    const rating = await Rating.findById(response.body._id)
    // Assert that the db was modified correctly
    expect(rating).not.toBeNull()
    // Assertions about the response
    expect(response.body).toMatchObject({
        fromID: userOneId.toString(),
        toID: userTwoId.toString(),
        rating: 3,
        comment: 'No comment given.'
    })
    // Asser that rating data of user changed
    const user2 = await User.findById(userTwoId)
    expect(user2.rating).toBe(3.5)
    expect(user2.totalRatings).toBe(2)
})

test('Should not create a rating for user if fromID and toID are the same', async () => {
    await request(app)
        .post('/ratings')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            fromID: userOneId,
            toID: userOneId,
            rating: 3
        })
        .expect(400)
})

test('Should return correct number of ratings for GET /ratings/me', async () => {
    const response = await request(app)
        .get('/ratings/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    // Assert that the number of ratings returned is equal to two
    expect(response.body.length).toEqual(2)
})

test('Should fetch user rating by id', async () => {
    const response = await request(app)
        .get(`/ratings/${ratingOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    // Assert that correct rating was returned
    const rating = await Rating.findById(response.body._id)
    expect(rating).toMatchObject(ratingOne)
})

test('Should return correct number of ratings for given fromID', async () => {
    const response = await request(app)
        .get(`/ratings?fromID=${userThreeId}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    //Assert that the number of ratings with fromID equal to userThreeId is 2
    expect(response.body.total).toEqual(2)
})

test('Should return correct number of ratings for given toID', async () => {
    const response = await request(app)
        .get(`/ratings?toID=${userThreeId}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    //Assert that the number of ratings with toID equal to userThreeId is 0
    expect(response.body.total).toEqual(0)
})

test('Should return ratings in descending order according to updatedAt', async () => {
    const response = await request(app)
        .get('/ratings')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    //Assert that the first rating was the latest to be modified
    expect(response.body.ratings[0].updatedAt).toBeGreaterThanOrEqual(response.body.ratings[1].updatedAt)
})

test('Should not let a user delete a rating given by some other user', async () => {
    await request(app)
    .delete(`/ratings/${ratingThree._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)
    // Assert that the rating still remains in the database 
    const rating = await Rating.findById(ratingThree._id)
    expect(rating._id).not.toBeNull()
})

test('Should not create a rating with invalid fromID', async () => {
    await request(app)
        .post('/routes')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            fromID: 'abcd',
            toID: userTwoId,
            rating: 3
        })
        .expect(400)
})

test('Should not create a rating with invalid toID', async () => {
    await request(app)
        .post('/ratings')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            fromID: userOneId,
            toID: 'abcd',
            rating: 3
        })
        .expect(400)
})

test('Updating a rating should reflect on the receiving user rating', async () => {
    await request(app)
        .patch(`/ratings/${ratingOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            rating: 2
        })
        .expect(200)
    // Assert that the user rating has now decreased to just 3 now 
    // while totalRatings remain the same(2)
    const user = await User.findById(userOneId)
    expect(user.rating).toEqual(3)
    expect(user.totalRatings).toEqual(2)
})

test('Should not update a rating with invalid rating value', async () => {
    await request(app)
        .patch(`/ratings/${ratingOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            rating: -1
        })
        .expect(400)
})

test('Should not update the fromID of a rating', async () => {
    await request(app)
        .patch(`/ratings/${ratingOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            fromID: userTwoId
        })
        .expect(400)
})

test('Should not update the toID of a rating', async () => {
    await request(app)
        .patch(`/ratings/${ratingOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            toID: userTwoId
        })
        .expect(400)
})

test("Should not update other user's rating", async () => {
    await request(app)
        .patch(`/ratings/${ratingTwo._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            comment: 'New comment'
        })
        .expect(404)
})

test('Should delete user rating where fromID is the user id', async () => {
    await request(app)
        .delete(`/ratings/${ratingOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(200)
    // Assert that the rating doesn't exist anymore in the db
    const rating = await Rating.findById(ratingOne._id)
    expect(rating).toBeNull()
})

test("Should not delete rating if userID is not equal to fromID", async () => {
    await request(app)
        .delete(`/ratings/${ratingOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(404)
    // Assert that the rating still exists in the db
    const rating = await Rating.findById(ratingOne._id)
    expect(rating).not.toBeNull()
})

test('Should not delete user rating if unauthenticated', async () => {
    await request(app)
        .delete(`/ratings/${ratingOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}xx`)
        .send()
        .expect(401)
    // Assert that the rating still exists in the db
    const rating = await Rating.findById(ratingOne._id)
    expect(rating).not.toBeNull()
})

test('Should return second rating on page 2 when limit is 1', async () => {
    const response1 = await request(app)
        .get('/ratings?limit=1&page=2')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    //Assert that the rating on page 2 with limit 1 is the same as the second rating on page 1 with limit 10
    const response2 = await request(app)
        .get('/ratings')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response1.body.ratings[0]._id).toEqual(response2.body.ratings[1]._id)
})