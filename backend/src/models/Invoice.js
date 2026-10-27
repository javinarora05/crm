import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  itemName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
});

const invoiceSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      default: () => new Date().getFullYear(),
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expiredDate: {
      type: Date,
      required: true,
    },
    items: [invoiceItemSchema],
    subTotal: {
      type: Number,
      default: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
    },
    taxTotal: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'partially'],
      default: 'unpaid',
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'sent', 'paid', 'cancelled', 'on hold'],
      default: 'pending',
    },
    notes: {
      type: String,
      default: '',
    },
    removed: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

invoiceSchema.index({ number: 1, year: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
