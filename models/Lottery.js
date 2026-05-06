import mongoose from 'mongoose';

const LotterySchema = new mongoose.Schema({
  id: { type: Number, required: true },
  date: { type: Date, required: true },
  prizes: {
    first: { type: String, required: true },
    twoDigit: { type: String, required: true },
    threeDigitFirst: [{ type: String }],
    threeDigitLast: [{ type: String }]
  }
});

export default mongoose.models.Lottery || mongoose.model('Lottery', LotterySchema);
