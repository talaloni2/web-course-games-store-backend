import mongoose from "mongoose";

interface IPlatform {
  _id?: string;
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

const Platform = mongoose.model("platforms", platformSchema);
export {Platform, IPlatform};
