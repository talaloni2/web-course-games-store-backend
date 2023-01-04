import mongoose from "mongoose";

interface IPlatform {
  _id?: mongoose.Types.ObjectId;
  name: string;
  platform_logo: string;
  alternative_name: string;
  abbreviation: string;
}

const platformSchema = new mongoose.Schema<IPlatform>(
  {
    name: {
      type: String,
      require: true,
    },
    platform_logo: String,
    alternative_name: String,
    abbreviation: String,
  },
);

const Platform = mongoose.model("Platform", platformSchema);
export {Platform, IPlatform};
