export default interface ICreateGameRequest {
  totalRating: number;
  name: string;
  platforms: string[];
  summary: string;
  price: number;
  availability: number;
}
