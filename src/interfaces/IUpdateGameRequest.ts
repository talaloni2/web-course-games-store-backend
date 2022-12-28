export default interface IUpdateGameRequest {
  totalRating: number;
  name: string;
  platforms: number[];
  summary: string;
  price: number;
  availability: number;
}
