import userModel from "../models/user.model.js";

class UserRepository {
  create(data) {
    return userModel.create(data);
  }
  findByEmail(email, withPassword = false) {
    const query = userModel.findOne({ email });
    return withPassword ? query.select("+password") : query;
  }
  findById(id, withRefreshHash = false) {
    const query = userModel.findById(id);
    return withRefreshHash ? query.select("+refreshTokenHash") : query;
  }

  setRefreshTokenHash(userId, hash) {
    return userModel.findByIdAndUpdate(
      userId,
      { refreshTokenHash: hash },
      { new: true }
    );
  }

  clearRefreshTokenHash(userId) {
    return userModel.findByIdAndUpdate(userId, { refreshTokenHash: null });
  }
}

export default new UserRepository();
