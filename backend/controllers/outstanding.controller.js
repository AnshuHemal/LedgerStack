import { OutstandingPayable, OutstandingReceivable, AccountMaster } from "../models/user.model.js";

export const getOutstandingPayable = async (req, res) => {
  try {
    const entries = await OutstandingPayable.find({
      createdBy: req.user.userId,
    })
    .populate("account", "companyName city contactPerson mobileNo email")
    .sort({ date: -1 });

    // Group entries by account and calculate running balance
    const accountBalances = {};
    entries.forEach(entry => {
      const accountId = entry.account._id.toString();
      if (!accountBalances[accountId]) {
        accountBalances[accountId] = {
          account: entry.account,
          entries: [],
          currentBalance: 0
        };
      }
      accountBalances[accountId].entries.push(entry);
      accountBalances[accountId].currentBalance = entry.balance;
    });

    const result = Object.values(accountBalances).map(accountData => ({
      account: accountData.account,
      currentBalance: accountData.currentBalance,
      entries: accountData.entries
    }));

    res.status(200).json({ 
      success: true, 
      data: result 
    });
  } catch (err) {
    console.error("Error fetching outstanding payable:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

export const getOutstandingReceivable = async (req, res) => {
  try {
    const entries = await OutstandingReceivable.find({
      createdBy: req.user.userId,
    })
    .populate("account", "companyName city contactPerson mobileNo email")
    .sort({ date: -1 });

    // Group entries by account and calculate running balance
    const accountBalances = {};
    entries.forEach(entry => {
      const accountId = entry.account._id.toString();
      if (!accountBalances[accountId]) {
        accountBalances[accountId] = {
          account: entry.account,
          entries: [],
          currentBalance: 0
        };
      }
      accountBalances[accountId].entries.push(entry);
      accountBalances[accountId].currentBalance = entry.balance;
    });

    const result = Object.values(accountBalances).map(accountData => ({
      account: accountData.account,
      currentBalance: accountData.currentBalance,
      entries: accountData.entries
    }));

    res.status(200).json({ 
      success: true, 
      data: result 
    });
  } catch (err) {
    console.error("Error fetching outstanding receivable:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

export const getOutstandingBalance = async (req, res) => {
  try {
    const { accountId } = req.params;
    
    // Get the latest outstanding balance for the account
    const latestPayable = await OutstandingPayable.findOne(
      { account: accountId, createdBy: req.user.userId },
      {},
      { sort: { date: -1 } }
    );
    
    const latestReceivable = await OutstandingReceivable.findOne(
      { account: accountId, createdBy: req.user.userId },
      {},
      { sort: { date: -1 } }
    );

    const payableBalance = latestPayable ? latestPayable.balance : 0;
    const receivableBalance = latestReceivable ? latestReceivable.balance : 0;

    res.status(200).json({
      success: true,
      data: {
        payableBalance,
        receivableBalance,
        netBalance: receivableBalance - payableBalance
      }
    });
  } catch (err) {
    console.error("Error fetching outstanding balance:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};