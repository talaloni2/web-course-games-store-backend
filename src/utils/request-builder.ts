import IGameSortRequest from "../interfaces/IGameSortRequest";
import IGameSortUserRequest from "../interfaces/IGameSortUserRequest";

const contains = (value: string): undefined | object => {
  return value === undefined ? undefined : { $regex: value };
};

const filterUndefined = (searchQuery: object): object => {
  Object.keys(searchQuery).forEach(
    (key) => searchQuery[key] === undefined && delete searchQuery[key]
  );
  return searchQuery;
};

const between = (min: number, max: number): undefined | object => {
  let q: object = { $gte: min, $lte: max };
  q = filterUndefined(q);
  if (Object.entries(q).length === 0) return undefined;
  return q;
};

const listContainseOneOrMore = (
  vals: string,
  field: string
): undefined | object => {
  if (vals === null || vals === undefined) return undefined;
  const values = vals.split(",");
  if (values.length == 0) return undefined;
  return values.map((value) => {
    return { [field]: value };
  });
};

const sort = (sortFields: string): IGameSortUserRequest => {
  if (sortFields === undefined) return {};
  return sortFields
    .split(",")
    .map((field) =>
      field.startsWith("-")
        ? { key: field.substring(1), sort: "desc" }
        : { key: field, sort: "asc" }
    )
    .reduce((obj, item) => Object.assign(obj, { [item.key]: item.sort }), {});
};

export { contains, filterUndefined, between, sort, listContainseOneOrMore };
