import mongoose from "mongoose"

const inventorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["In stock", "On discount", "Donated", "Expired"],
      default: "In stock",
    },
    batchNumber: {
      type: String,
      required: true,
    },
    qrCode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Inventory || mongoose.model("Inventory", inventorySchema)
