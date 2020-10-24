const maintenance = async (req, res, next) => {
    res.status('503').send('Site is currently down. Check back later!')
}

module.exports = maintenance