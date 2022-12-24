const mongoose = require('mongoose');

// total_rating, name, platforms, screenshots, slug, summary, cover, alternative_names
const gameSchema = new mongoose.Schema({
    _id: Number,
    totalRating: Number,
    name: {
        type: String,
        require: true
    },
    platforms: [{ type: Number, ref: 'Platform' }],
    screenshots: [Number],
    slug: String,
    summary: String,
    cover: Number,
    price: Number,
    availability: Number,
}, { _id: false })

const Game = mongoose.model('games', gameSchema);
module.exports = Game;