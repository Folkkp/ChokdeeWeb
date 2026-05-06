import mongoose from 'mongoose';

const DreamSchema = new mongoose.Schema({
  keyword: { type: String, required: true },
  meaning: { type: String, required: true },
  luckyNumbers: [{ type: String }]
});

export default mongoose.models.Dream || mongoose.model('Dream', DreamSchema);
