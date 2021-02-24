const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Task = require('../models/task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid!')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: [6, 'Password too short'],
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"!')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be greater than 0')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

// Virtual property => relationships between 2 databases without changing the User model
// Not as the owner field in the Task database
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// Instance method to hide sensible data : Method #1
// userSchema.methods.getPublicProfile = function () {
//     const user = this;
//     const userObject = user.toObject(); // mongoose method
//     delete userObject.password
//     delete userObject.tokens
//     return userObject;
// }

// Method #2 : Override 'toJSON' method use by Express when sending 'res'
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject(); // mongoose method
    delete userObject.password
    delete userObject.tokens
    return userObject;
}

// Instance method = I need the 'this binding, thus using a classical function (no binding with arrow function)
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'ThisIsMySecretKey', { expiresIn: '7 days' })
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

// Create a static method for User model
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('Unable to find a user with this email!')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Wrong password')
    }
    return user
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this;
    // console.log('just before saving', user);
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});


// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({ owner: user._id })
    next();
})


const User = mongoose.model('User', userSchema);

module.exports = User;
