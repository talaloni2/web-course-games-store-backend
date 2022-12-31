import mongoose from "mongoose";

const isObjectId = (idCandidate: string): boolean => {
    try {
        new mongoose.Types.ObjectId(idCandidate);
    } catch {
        return false;
    }
    return true;
}