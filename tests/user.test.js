const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOne, userOneId, setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        'name': 'Anadi Kashyap',
        'email': 'anadi.kashyap1598@gmail.com',
        'password': 'lalalala',
        'age': 22
    }).expect(201)

    // Assert that the database was modified correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Anadi Kashyap',
            email: 'anadi.kashyap1598@gmail.com',
            age: 22,
            rating: 0
        },
        token: user.tokens[0].token
    })

    // Assert that the returned password is not plaintext
    expect(user.password).not.toBe('lalalala')
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    // Assert that a second token was created
    const user = await User.findById(response.body.user._id)
    expect(user.tokens[1].token).toBe(response.body.token)
})

test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'randomwrongpassword'
    }).expect(400)
})

test('Should get profile for authenticated user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for authenticated user', async () => {
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    // Assert that user is deleted from the database
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)
    // Assert that avatar was indeed saved in the database
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'xyz',
            age: 18
        })
        .expect(200)
    // Assert that the fields did get updated
    const user = await User.findById(userOneId)
    expect(user).toMatchObject({
        name: 'xyz',
        age: 18
    })
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'abc',
            dog: 'Lassie'
        })
        .expect(400)
    // Assert that no updates happened
    const user = await User.findById(userOneId)
    expect(user).not.toMatchObject({
        name: 'abc'
    })
    expect(user).not.toMatchObject({
        dog: 'Lassie'
    })
    expect(user).toMatchObject({
        name: 'Aditya Kashyap'
    })
})

test('Should have 0 rating at first', async () => {
    const response = await request(app).post('/users').send({
        'name': 'Anadi Kashyap',
        'email': 'anadi.kashyap1598@gmail.com',
        'password': 'lalalala',
        'age': 22
    }).expect(201)

    // Assert that the database was modified correctly
    const user = await User.findById(response.body.user._id)
    expect(user).toMatchObject({
        rating: 0,
        totalRatings: 0
    })
})

test('Should not signup user with invalid name', async () => {
    await request(app).post('/users').send({
        'name': '',
        'email': 'john@gmail.com',
        'password': 'lalalala',
        'age': 22
    }).expect(400)
})

test('Should not signup user with invalid email', async () => {
    await request(app).post('/users').send({
        'name': 'John',
        'email': 'gmail.com',
        'password': 'lalalala',
        'age': 22
    }).expect(400)
})

test('Should not signup user with invalid password', async () => {
    await request(app).post('/users').send({
        'name': 'Johnny',
        'email': 'john@gmail.com',
        'password': 'lala',
        'age': 22
    }).expect(400)
})

test('Should not signup user with invalid age', async () => {
    await request(app).post('/users').send({
        'name': 'Johnny',
        'email': 'john@gmail.com',
        'password': 'lalalala',
        'age': -1
    }).expect(400)
})

test('Should not update user if unauthenticated', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}xyz`)
        .send({
            name: 'xyz',
            age: 18
        })
        .expect(401)
})

test('Should not update user with invalid name', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: '',
            age: 18
        })
        .expect(400)
})

test('Should not update user with invalid email', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            email: 'xyz.com'
        })
        .expect(400)
})

test('Should not update user with invalid password', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            password: 'xyz'
        })
        .expect(400)
})