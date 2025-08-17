import { QuickEntry } from "../models/user.model.js";

export const getQuickEntries = async (req, res) => {
  const { entryType, entryAccount } = req.query;
  try {
    const entries = await QuickEntry.find({
      createdBy: req.user.userId,
      entryType,
      entryAccount,
    }).populate("account");
    res.status(200).json({ success: true, data: entries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addQuickEntries = async (req, res) => {
  try {

    const {
      entryType,
      entryAccount,
      date,
      day,
      voucher_no,
      cheque_no,
      account,
      amount,
    } = req.body;

    if (!entryType || !entryAccount || !date || !day || !account || !amount) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const newEntry = new QuickEntry({
      entryType,
      entryAccount,
      date,
      day,
      voucher_no,
      cheque_no,
      account,
      amount,
      createdBy: req.user.userId, // or req.user._id based on your JWT
    });

    await newEntry.save();

    res
      .status(201)
      .json({ success: true, message: "Entry added successfully." });
  } catch (err) {
    console.error("🔥 Error while saving QuickEntry:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
