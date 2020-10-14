'use strict';

const mongoose = require('mongoose');
const mongooseUniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    enabled: {
        type: Boolean,
        default: false,
        required: true
    },
    adminEnabled: {
        type: Boolean,
        default: false,
        required: true
    },
    numAttempt: {
        type: Number,
        default: 0,
        required: true
    },
    lastAttempt: {
        type: Number,
        default: Date.now(),
        required: true
    },
    institution: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution'
    },
    created: {
        type: Date,
        default: Date.now,
        required: true
    },
    updated: {
        type: Date,
        default: Date.now,
        required: true
    }
});

userSchema.plugin(mongooseUniqueValidator);


const institutionSchema = new mongoose.Schema({
    state_short: {
        type: String,
        required: true
    },
    name1: {
        type: String,
        required: true
    },
    name2: {
        type: String
    },
    location: {
        type: String,
        required: true
    },
    address1: {
        street: {
            type: String
        },
        city: {
            type: String
        }
    },
    address2: {
        street: {
            type: String
        },
        city: {
            type: String
        }
    },
    phone: {
        type: String,
        required: true
    },
    fax: {
        type: String,
        required: true
    },
    email: [{
        type: String
    }],
    state_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State'
    },
    created: {
        type: Date,
        default: Date.now,
        required: true
    },
    updated: {
        type: Date,
        default: Date.now,
        required: true
    }
});

institutionSchema.plugin(mongooseUniqueValidator);

const stateSchema = new mongoose.Schema({
    short: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now,
        required: true
    },
    updated: {
        type: Date,
        default: Date.now,
        required: true
    }
});

stateSchema.plugin(mongooseUniqueValidator);

const User = mongoose.model('User', userSchema);
const Institution = mongoose.model('Institution', institutionSchema);
const State = mongoose.model('State', stateSchema);

const models = module.exports = {
	User,
	Institution,
	State
}
