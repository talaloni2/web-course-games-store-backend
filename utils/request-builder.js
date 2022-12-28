const contains = (value) => {
    return value === undefined ? undefined : { $regex: value }
}

const filterUndefined = (searchQuery) => {
    Object.keys(searchQuery).forEach(key => searchQuery[key] === undefined && delete searchQuery[key])
    return searchQuery;
}

const between = (min, max) => {
    let q = { $gte: min, $lte: max };
    q = filterUndefined(q);
    if (Object.entries(q).length === 0) return undefined;
    return q
}

const listContainseOneOrMore = (valuesString, field) => {
    if (valuesString === null || valuesString === undefined) return undefined;
    let values = valuesString.split(",");
    if (values.length == 0) return undefined;
    return values.map(value => {return {[field]: value}});
}

const sort = (sortFields) => {
    if (sortFields === undefined) return {};
    return sortFields.split(",")
        .map(field => field.startsWith("-") ? { key: field.substring(1), sort: "desc" } : { key: field, sort: "asc" })
        .reduce((obj, item) => Object.assign(obj, { [item.key]: item.sort }), {});
}

module.exports = {
    contains,
    filterUndefined,
    between,
    sort,
    listContainseOneOrMore,
}