const mongoose = require('mongoose');

// total_rating, name, platforms, screenshots, slug, summary, cover, alternative_names
const platformSchema = new mongoose.Schema({
    _id: Number,
    name: {
        type: String,
        require: true
    },
    slug: String,
    platform_logo: Number,
    alternative_name: String
}, { _id: false })

const Platform = mongoose.model('platforms', platformSchema);
module.exports = Platform;