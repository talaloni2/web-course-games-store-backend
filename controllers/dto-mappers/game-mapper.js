const mapToGamesList = (games) => {
    return games.map(game => {
        return {
            rating: game.totalRating || null,
            name: game.name,
            cover: game.cover || null,
            id: game._id,
            price: game.price,
            availability: game.availability,
        }
    });
}

module.exports = {
    mapToGamesList
};