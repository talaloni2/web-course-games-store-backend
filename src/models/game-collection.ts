import mongoose from "mongoose";

// total_rating, name, platforms, screenshots, slug, summary, cover, alternative_names
interface IGameCollection {
    _id: number,
    name: string,
    games: number[],
}
const gameCollectionSchema = new mongoose.Schema<IGameCollection>(
  {
    _id: Number,
    name: {
      type: String,
      require: true,
    },
    games: [{ type: Number, ref: "Game" }],
  },
  { _id: false }
);

const GameCollection = mongoose.model("gameCollections", gameCollectionSchema);
export {GameCollection, IGameCollection};
