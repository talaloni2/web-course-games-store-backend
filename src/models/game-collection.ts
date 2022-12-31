import mongoose from "mongoose";

// total_rating, name, platforms, screenshots, slug, summary, cover, alternative_names
interface IGameCollection {
    _id?: string,
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

const GameCollection = mongoose.model("gameCollections", gameCollectionSchema);
export {GameCollection, IGameCollection};
