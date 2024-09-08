const mongoose = require("mongoose");

const predSchema = mongoose.Schema(
  {
    event: {
      type: String,
      required: [true, "Event cannot be empty"],
    },
    prematch: {
      type: String,
      required: [true, "Prematch cannot be empty"],
    },
    selection: {
      type: String,
      required: [true, "Selection cannot be empty"],
    },
    type: {
      type: String,
      enum: ["free", "premium"],
      required: [true, "Type cannot be empty"],
    },
  },
  { timestamps: true },
);

predSchema.virtual("date").get(function () {
  const date = this.createdAt;
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
});

predSchema.set("toJSON", { virtuals: true });
predSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Predictions", predSchema);
