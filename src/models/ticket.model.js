import mongoose from 'mongoose';

const { Schema } = mongoose;

const ticketSchema = new Schema({
  code: { type: String, required: true, unique: true },
  purchase_datetime: { type: Date, default: Date.now },
  amount: { type: Number, required: true, min: [0, 'amount debe ser >= 0'] },
  purchaser: { type: String, required: true }, // email del comprador
  products: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }]
}, { timestamps: true });

export default mongoose.model('Ticket', ticketSchema);

