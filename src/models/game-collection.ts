import mongoose from "mongoose";

// total_rating, name, platforms, screenshots, slug, summary, cover, alternative_names
interface IGameCollection {
    _id?: mongoose.Types.ObjectId,
    name: string,
    games: string[],
}
const gameCollectionSchema = new mongoose.Schema<IGameCollection>(
  {
    name: {
      type: String,
      require: true,
    },
    games: [{ type: mongoose.Types.ObjectId, ref: "Game" }],
  },
);

const GameCollection = mongoose.model("GameCollection", gameCollectionSchema);
export {GameCollection, IGameCollection};
