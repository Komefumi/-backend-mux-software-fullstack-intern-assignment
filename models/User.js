import mongoose from 'mongoose';

import { STORES } from '../constants';

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    birthday: {
      type: Date,
      required: true,
    },
    store: {
      type: String,
      enum: STORES,
      required: true,
    },
  },
  { timestamps: true },
);

const User = mongoose.model('User', UserSchema);

export default User;
