export default interface IUpdateGameRequest {
  totalRating: number;
  name: string;
  platforms: string[];
  summary: string;
  price: number;
  availability: number;
}
