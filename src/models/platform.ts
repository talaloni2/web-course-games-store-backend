import mongoose from "mongoose";

interface IPlatform {
  _id: number;
  name: string;
  platform_logo: string;
  alternative_name: string;
  abbreviation: string;
}

const platformSchema = new mongoose.Schema<IPlatform>(
  {
    _id: Number,
    name: {
      type: String,
      require: true,
    },
    platform_logo: String,
    alternative_name: String,
    abbreviation: String,
  },
  { _id: false }
);

const Platform = mongoose.model("platforms", platformSchema);
export {Platform, IPlatform};
