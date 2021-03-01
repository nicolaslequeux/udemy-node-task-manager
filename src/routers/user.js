const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')

const router = new express.Router();

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        // res.send({ user: user.getPublicProfile(), token }) // method #1 in user model
        res.send({ user, token }) // method #2 in user model (override toJSON model)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Logout a unique session for a user (mobile or desktop...)
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token;
        })
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send()
    }
})

// Logout all sessions for a user (all browser, appliances...)
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send()
    }
})

// ROUTE(PATH, MIDDLEWARE, CALLBACK)
// router.get('/users', auth, async (req, res) => {
//     try {
//         const users = await User.find({})
//         res.send(users)
//     } catch (e) {
//         res.status(500).send()
//     }
// })

// With auth middleware, we get the user back authenticated, no need to fetch it.
// This route will work only if user is authenticated
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
})

// ROUTE NOT USED ANYMORE SINCE WE HAVE : router.get('/users/me'
// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id
//     try {
//         const user = await User.findById(_id)
//         if (!user) {
//             return res.status(404).send()
//         }
//         res.send(user)
//     } catch (e) {
//         res.status(500).send()
//     }
// })

// WITHOUT AUTH I CAN UPDATE SOMEONE ELSE IF I KNOW THE ID!
// router.patch('/users/:id', async (req, res) => {
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['name', 'email', 'password', 'age']
//     const isValidOperation = updates.every(update => allowedUpdates.includes(update))

//     if (!isValidOperation) {
//         return res.status(400).send({ error: "Invalid updates!" })
//     }

//     try {
//         //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
//         const user = await User.findById(req.params.id)
//         updates.forEach(update => user[update] = req.body[update])
//         await user.save();

//         if (!user) {
//             return res.status(404).send()
//         }

//         res.status(200).send(user)
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid updates!" })
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save();
        res.status(200).send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})


router.delete('/users/me', auth, async (req, res) => {
    // router.delete('/users/:id', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.params.id)
        // const user = await User.findByIdAndDelete(req.user._id)
        // if (!user) {
        //     return res.status(404).send()
        // }
        await req.user.remove();
        sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }

})

// Avatar upload
const upload = multer({
    // dest: 'avatars', // Without 'dest' multer does not save avatar but give it available in the function
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new Error('Please upload a jpg, jpeg or png file under 1Mo'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    // req.user.avatar = req.file.buffer
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer
    await req.user.save()
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send("Avatar deleted")
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            return new Error();
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})


module.exports = router
