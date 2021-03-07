import mongoose from 'mongoose';

const ELECTRONICS = 'electronics';
const TOYS = 'toys';

const UserSchema = new mongoose.Schema(
  {
    accountName: {
      type: String,
      enum: [ELECTRONICS, TOYS],
      unique: true,
    },
    additionalFields: {},
  },
  { timestamps: true },
);

const User = mongoose.model('User', UserSchema);

export default User;
