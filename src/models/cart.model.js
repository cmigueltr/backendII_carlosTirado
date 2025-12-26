import mongoose from 'mongoose';

const { Schema } = mongoose;

const cartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: [1, 'quantity debe ser >= 1'] }
}, { _id: false });

const cartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  products: [cartItemSchema]
}, { timestamps: true });

export default mongoose.model('Cart', cartSchema);

