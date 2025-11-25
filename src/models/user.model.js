import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
  first_name: { type: String, required: [true, 'first_name obligatorio'] },
  last_name:  { type: String, required: [true, 'last_name obligatorio'] },
  email:      { type: String, required: [true, 'email obligatorio'], unique: true },
  age:        { type: Number, min: [0, 'age debe ser >= 0'] },
  password:   { type: String, required: [true, 'password obligatorio'] }, // hash
  // cart no requerido para esta consigna, lo omitimos
  role:       { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
