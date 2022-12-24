const { filterUndefined, contains, between } = require("../../utils/request-builder");


const buildGameListQuery = (params) => {
    let search = {
        _id: params.id,
        name: contains(params.name),
        price: between(params.priceMin, params.priceMax),
        availability: between(params.availabilityMin, params.availabilityMax),
    };
    return filterUndefined(search);
}


module.exports = {
    buildGameListQuery,
}