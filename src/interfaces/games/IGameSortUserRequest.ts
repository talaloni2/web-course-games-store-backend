import { SortOrder } from "mongoose";

export default interface IGameSortRequest {
    id?: undefined | SortOrder,
    name?: undefined | SortOrder,
    price?: undefined | SortOrder,
    availability?: undefined | SortOrder,
}