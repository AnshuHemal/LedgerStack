import { AccountGroup, AccountMaster } from "../models/user.model.js";

export const addAccountGroup = async (req, res) => {
  try {
    const { name, effect } = req.body;
    const createdBy = req.user.userId;

    const existing = await AccountGroup.findOne({
      name,
      createdBy,
    });
    if (existing) {
      return res.status(400).json({ message: "Account Group already exists" });
    }

    const newType = new AccountGroup({ name, effect, createdBy });
    await newType.save();

    res
      .status(201)
      .json({ message: "Account Group created successfully", data: newType });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server error" + err.message, error: err.message });
  }
};

export const getAccountGroup = async (req, res) => {
  const createdBy = req.user.userId;
  try {
    const types = await AccountGroup.find({ createdBy });
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAccountGroupById = async (req, res) => {
  const groupId = req.params.id;
  try {
    const group = await AccountGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Account Group not found" });
    }
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateAccountGroup = async (req, res) => {
  const { name, effect } = req.body;
  const groupId = req.params.id;

  try {
    const group = await AccountGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Account Group not found" });
    }

    group.name = name || group.name;
    group.effect = effect || group.effect;

    await group.save();
    res.status(200).json({ message: "Account Group updated..", data: group });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAccountGroup = async (req, res) => {
  const groupId = req.params.id;

  try {
    const group = await AccountGroup.findByIdAndDelete(groupId);
    if (!group) {
      return res.status(404).json({ message: "Account Group not found" });
    }
    res.status(200).json({ message: "Account Group deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addAccountMaster = async (req, res) => {
  const createdBy = req.user.userId;
  try {
    const accountData = {
      ...req.body,
      createdBy,
    };

    const newAccount = new AccountMaster(accountData);
    await newAccount.save();

    res.status(201).json({
      message: "Account added successfully",
      data: newAccount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAccountMaster = async (req, res) => {
  const createdBy = req.user.userId;
  try {
    const accounts = await AccountMaster.find({
      createdBy,
    }).populate("accountGroup", "name");
    res.status(200).json(accounts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch account masters", error: err });
  }
};

export const getAccountMasterById = async (req, res) => {
  const accountId = req.params.id;
  try {
    const account = await AccountMaster.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Account Master not found" });
    }
    res.json(account);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateAccountMaster = async (req, res) => {
  const accountId = req.params.id;

  try {
    const updatedAccount = await AccountMaster.findByIdAndUpdate(
      accountId,
      req.body,
      { new: true }
    );

    if (!updatedAccount) {
      return res.status(404).json({ message: "Account Master not found" });
    }

    res.status(200).json({
      message: "Account updated successfully",
      data: updatedAccount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAccountMaster = async (req, res) => {
  const accountId = req.params.id;

  try {
    const deletedAccount = await AccountMaster.findByIdAndDelete(accountId);
    if (!deletedAccount) {
      return res.status(404).json({ message: "Account Master not found" });
    }

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getBankAccounts = async (req, res) => {
  try {
    const accounts = await AccountMaster.find({ createdBy: req.user.userId })
      .populate({
        path: "accountGroup",
        match: { name: "Bank Accounts" },
      })
      .then((results) => results.filter((acc) => acc.accountGroup)); 

    res.status(200).json({ success: true, data: accounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
