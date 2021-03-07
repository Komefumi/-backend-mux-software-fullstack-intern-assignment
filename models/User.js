import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    phone: Number,
    birthday: Date,
  },
  { timestamps: true },
);

const User = mongoose.model('User', UserSchema);

export default User;
