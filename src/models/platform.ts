import mongoose from "mongoose";

interface IPlatform {
  _id: number;
  name: string;
  slug: string;
  platform_logo: number;
  alternative_name: string;
}

const platformSchema = new mongoose.Schema<IPlatform>(
  {
    _id: Number,
    name: {
      type: String,
      require: true,
    },
    slug: String,
    platform_logo: Number,
    alternative_name: String,
  },
  { _id: false }
);

const Platform = mongoose.model("platforms", platformSchema);
export {Platform, IPlatform};
