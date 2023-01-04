import mongoose, { Schema, model, mongo } from "mongoose";

// total_rating, name, platforms, screenshots, slug, summary, cover, alternative_names

interface IGame {
  _id?: mongoose.Types.ObjectId;
  totalRating: number;
  name: string;
  platforms: string[];
  screenshots: string[];
  summary: string;
  cover: string;
  price: number;
  availability: number;
}

const gameSchema = new Schema<IGame>(
  {
    totalRating: Number,
    name: {
      type: String,
      require: true,
    },
    platforms: [{ type: mongoose.Types.ObjectId, ref: "Platform" }],
    screenshots: [String],
    summary: String,
    cover: String,
    price: Number,
    availability: Number,
  },
);

const Game = model("Game", gameSchema);
export { Game, IGame };
