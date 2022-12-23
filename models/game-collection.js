const mongoose = require('mongoose');

// total_rating, name, platforms, screenshots, slug, summary, cover, alternative_names
const gameCollectionSchema = new mongoose.Schema({
    _id: Number,
    name: {
        type: String,
        require: true
    },
    games: [{ type: Number, ref: 'Game' }],
    slug: String,
    platform_logo: Number,
}, { _id: false })

const GameCollection = mongoose.model('gameCollections', gameCollectionSchema);
module.exports = GameCollection;