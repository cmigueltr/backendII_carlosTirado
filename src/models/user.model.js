import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
  first_name: { type: String, required: [true, 'first_name obligatorio'] },
  last_name:  { type: String, required: [true, 'last_name obligatorio'] },
  email:      { type: String, required: [true, 'email obligatorio'], unique: true },
  age:        { type: Number, min: [0, 'age debe ser >= 0'] },
  password:   { type: String, required: [true, 'password obligatorio'] }, // hash
  role:       { type: String, enum: ['user', 'admin'], default: 'user' },
  cart:       { type: Schema.Types.ObjectId, ref: 'Cart' },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
