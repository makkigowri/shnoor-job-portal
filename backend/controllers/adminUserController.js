const {
  listUsersAdmin,
  getUserByIdAdmin,
  setUserBlockedStatus,
  deleteUserAdminById
} = require("../models/adminStatsModel");

const listUsers = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const result = await listUsersAdmin({ search, status, page: Number(page), limit: Number(limit) });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const viewUser = async (req, res, next) => {
  try {
    const user = await getUserByIdAdmin(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const blockUser = async (req, res, next) => {
  try {
    const user = await setUserBlockedStatus(req.params.id, true);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User blocked successfully", user });
  } catch (error) {
    next(error);
  }
};

const unblockUser = async (req, res, next) => {
  try {
    const user = await setUserBlockedStatus(req.params.id, false);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User unblocked successfully", user });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const deleted = await deleteUserAdminById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { listUsers, viewUser, blockUser, unblockUser, deleteUser };
