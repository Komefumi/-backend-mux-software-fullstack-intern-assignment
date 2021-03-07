import mongoose from 'mongoose';
import { STORES } from '../constants';

const StoreSchema = new mongoose.Schema(
  {
    accountName: {
      type: String,
      enum: STORES,
      unique: true,
    },
    additionalFields: {},
  },
  { timestamps: true },
);

const Store = mongoose.model('Store', StoreSchema);

export default Store;
