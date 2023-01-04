export default interface IGameUserSearchRequest {
    id?: undefined | string,
    name?: undefined | string,
    priceMin?: undefined | number,
    priceMax?: undefined | number,
    availabilityMin?: undefined | number,
    availabilityMax?: undefined | number,
    platforms?: undefined | string,
    sort?: undefined | string,
    page?: number,
    size?: number,
}