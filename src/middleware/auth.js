const jwt = require('jsonwebtoken');

const User = require('../models/user');

const auth = async (req, res, next) => {

    try {

        // Is-there an 'Authorization" header with 'Bearer eyJhbGci...'?
        const token = req.header('Authorization').replace('Bearer ', '');
        // Is the token 'eyJhbGci...' valid?
        const decoded = jwt.verify(token, 'ThisIsMySecretKey');
        // Is there a user with the decoded _id and valid token?
        const user = await User.findOne({ _id: decoded._id, 'tokens.token' : token });

        if (!user) {
            throw new Error();
        }

        // As auth already fetched the user, I can pass it to avoid another GET from actions to follow (after this middleware)
        req.user = user;
        req.token = token;
        next();

    } catch (e) {

        res.status(401).send({ error: 'Please authenticate.' })

    }

}

module.exports = auth;
