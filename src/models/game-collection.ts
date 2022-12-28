import mongoose from "mongoose";

// total_rating, name, platforms, screenshots, slug, summary, cover, alternative_names
interface IGameCollection {
    _id: number,
    name: string,
    games: number[],
    slug: string,
    platform_logo: string,
}
const gameCollectionSchema = new mongoose.Schema<IGameCollection>(
  {
    _id: Number,
    name: {
      type: String,
      require: true,
    },
    games: [{ type: Number, ref: "Game" }],
    slug: String,
    platform_logo: Number,
  },
  { _id: false }
);

const GameCollection = mongoose.model("gameCollections", gameCollectionSchema);
export {GameCollection, IGameCollection};
