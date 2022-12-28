const { filterUndefined, contains, between, sort, listContainseOneOrMore } = require("../../utils/request-builder");


const buildGameListQuery = (params) => {
    let search = {
        _id: params.id,
        name: contains(params.name),
        price: between(params.priceMin, params.priceMax),
        availability: between(params.availabilityMin, params.availabilityMax),
        $or: listContainseOneOrMore(params.platforms, "platforms"),
    };
    return filterUndefined(search);
}

const buildGameListSort = (sortFields) => {
    let sortRequest = sort(sortFields);
    sortRequest = {
        _id: sortRequest.id,
        name: sortRequest.name,
        price: sortRequest.price,
        availability: sortRequest.availability,
    };
    return filterUndefined(sortRequest);
}


module.exports = {
    buildGameListQuery,
    buildGameListSort,
}