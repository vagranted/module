const {Schema, model} = require('mongoose');

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 255
    },
    surname: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 255
    },

    middlename: {
        type: String,
        minlength: 2,
        maxlength: 255
    },

    email: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 255,
        unique: true,
     },
    username: {
        type: String,
        minlength: 2,
        maxlength: 15
    },
    password: {
        type: String,
        required: true,

    },
    isActivated: {type: Boolean, default: false},
    activationLink: {type: String},
    resetToken: {
        type: String,
    }
})

module.exports = model('User', UserSchema);