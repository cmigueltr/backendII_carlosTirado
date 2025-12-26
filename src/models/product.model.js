import mongoose from 'mongoose';

const { Schema } = mongoose;

const productSchema = new Schema({
  title: { type: String, required: [true, 'title obligatorio'] },
  description: { type: String, required: [true, 'description obligatorio'] },
  price: { type: Number, required: [true, 'price obligatorio'], min: [0, 'price debe ser >= 0'] },
  thumbnail: { type: String },
  code: { type: String, required: [true, 'code obligatorio'], unique: true },
  stock: { type: Number, required: [true, 'stock obligatorio'], min: [0, 'stock debe ser >= 0'] },
  category: { type: String, required: [true, 'category obligatorio'] },
  status: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);

