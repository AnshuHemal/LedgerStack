import { QuickEntry, OutstandingPayable, OutstandingReceivable, SalesInvoice, PurchaseInvoice } from "../models/user.model.js";

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
      createdBy: req.user.userId,
    });

    await newEntry.save();

    // Handle Slip Book and Cheque entries for outstanding balance tracking
    if (entryType === "Slip Book") {
      try {
        // For Slip Book entries - show CREDIT entry in Outstanding Payable (money going out to suppliers)
        const lastPayableEntry = await OutstandingPayable.findOne(
          { account: account },
          {},
          { sort: { date: -1 } }
        );
        const lastBalance = lastPayableEntry ? lastPayableEntry.balance : 0;
        
        // Credit entry reduces the payable balance (money going out to suppliers)
        const netBalance = lastBalance - amount;
        
        // Create new Outstanding Payable entry with CREDIT
        const newPayableEntry = new OutstandingPayable({
          account: account,
          date: new Date(date),
          voucher_no: voucher_no,
          description: `Slip Book Entry (Credit) - ${day}`,
          debitAmount: 0,
          creditAmount: amount, // CREDIT entry
          balance: netBalance,
          createdBy: req.user.userId,
        });
        
        await newPayableEntry.save();
        
        // Update the QuickEntry with outstanding balance info
        newEntry.lastBalance = lastBalance;
        newEntry.currentAmt = amount;
        newEntry.netBalance = netBalance;
        await newEntry.save();
        
      } catch (outstandingError) {
        console.error("Error handling outstanding balance:", outstandingError);
        // Continue with the main entry even if outstanding tracking fails
      }
    } else if (entryType === "Cheque") {
      try {
        // For Cheque entries - show DEBIT entry in Outstanding Receivable (money coming in from customers)
        const lastReceivableEntry = await OutstandingReceivable.findOne(
          { account: account },
          {},
          { sort: { date: -1 } }
        );
        const lastBalance = lastReceivableEntry ? lastReceivableEntry.balance : 0;
        
        // Debit entry increases the receivable balance (money coming in from customers)
        const netBalance = lastBalance + amount;
        
        // Create new Outstanding Receivable entry with DEBIT
        const newReceivableEntry = new OutstandingReceivable({
          account: account,
          date: new Date(date),
          voucher_no: voucher_no,
          description: `Cheque Entry (Debit) - ${day}`,
          debitAmount: amount, // DEBIT entry
          creditAmount: 0,
          balance: netBalance,
          createdBy: req.user.userId,
        });
        
        await newReceivableEntry.save();
        
        // Update the QuickEntry with outstanding balance info
        newEntry.lastBalance = lastBalance;
        newEntry.currentAmt = amount;
        newEntry.netBalance = netBalance;
        await newEntry.save();
        
      } catch (outstandingError) {
        console.error("Error handling outstanding balance:", outstandingError);
        // Continue with the main entry even if outstanding tracking fails
      }
    } else if (entryType === "Purchase Slip Book") {
      try {
        // For Purchase Slip Book entries - show CREDIT entry in Outstanding Payable (money going out to suppliers)
        const lastPayableEntry = await OutstandingPayable.findOne(
          { account: account },
          {},
          { sort: { date: -1 } }
        );
        const lastBalance = lastPayableEntry ? lastPayableEntry.balance : 0;
        
        // Credit entry reduces the payable balance (money going out to suppliers)
        const netBalance = lastBalance - amount;
        
        // Create new Outstanding Payable entry with CREDIT
        const newPayableEntry = new OutstandingPayable({
          account: account,
          date: new Date(date),
          voucher_no: voucher_no,
          description: `Purchase Slip Book Entry (Credit) - ${day}`,
          debitAmount: 0,
          creditAmount: amount, // CREDIT entry
          balance: netBalance,
          createdBy: req.user.userId,
        });
        
        await newPayableEntry.save();
        
        // Update the QuickEntry with outstanding balance info
        newEntry.lastBalance = lastBalance;
        newEntry.currentAmt = amount;
        newEntry.netBalance = netBalance;
        await newEntry.save();
      } catch (outstandingError) {
        console.error("Error handling outstanding balance:", outstandingError);
        // Continue with the main entry even if outstanding tracking fails
      }
    }

    res
      .status(201)
      .json({ 
        success: true, 
        message: "Entry added successfully.",
        data: {
          entry: newEntry,
          outstandingInfo: (entryType === "Slip Book" || entryType === "Cheque" || entryType === "Purchase Slip Book") ? {
            lastBalance: newEntry.lastBalance,
            currentAmt: newEntry.currentAmt,
            netBalance: newEntry.netBalance
          } : null
        }
      });
  } catch (err) {
    console.error("🔥 Error while saving QuickEntry:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
