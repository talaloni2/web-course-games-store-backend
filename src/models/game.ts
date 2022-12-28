import { Schema, model } from "mongoose";

// total_rating, name, platforms, screenshots, slug, summary, cover, alternative_names

interface IGame {
  _id: number;
  totalRating: number;
  name: string;
  platforms: number[];
  screenshots: string[];
  summary: string;
  cover: string;
  price: number;
  availability: number;
}

const gameSchema = new Schema<IGame>(
  {
    _id: Number,
    totalRating: Number,
    name: {
      type: String,
      require: true,
    },
    platforms: [{ type: Number, ref: "Platform" }],
    screenshots: [String],
    summary: String,
    cover: String,
    price: Number,
    availability: Number,
  },
  { _id: false }
);

const Game = model("games", gameSchema);
export { Game, IGame };
