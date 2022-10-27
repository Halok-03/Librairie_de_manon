const mongoose = require('mongoose')

const BookModel = mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        author: {
            type: String,
            required: true
        },
        resume: {
            type: String,
            required: true
        },
        editor: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String,
            required: true
        },
        note: {
            type: Number,
            required: true
        },
        lu: {
            type: Number,
            required: true
        },
        usersLu: {
          type: [ "String <userId>" ],
          required: true
        },
        possedes: {
          type: Number,
          required: true
        },
        usersPossedes: {
            type: [ "String <userId>" ],
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        genre: {
            type: String,
            required: true
        },
        parution: {
            type: Date,
            required: true
        }
    }
)

module.exports = mongoose.model('livres', BookModel)