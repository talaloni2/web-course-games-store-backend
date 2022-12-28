export default interface ICreateGameRequest {
  totalRating: number;
  name: string;
  platforms: number[];
  summary: string;
  price: number;
  availability: number;
}
