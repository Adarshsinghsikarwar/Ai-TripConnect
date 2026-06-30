import User from '../models/user.model.js';

class UserRepository {
  create(data) {
    return User.create(data);
  }

  findByEmail(email, withSensitive = false) {
    const query = User.findOne({ email });
    return withSensitive ? query.select('+password +refreshTokenHash +failedLoginAttempts +lockUntil') : query;
  }

  findById(id, withSensitive = false) {
    const query = User.findById(id);
    return withSensitive ? query.select('+refreshTokenHash +failedLoginAttempts +lockUntil') : query;
  }

  setRefreshTokenHash(userId, hash) {
    return User.findByIdAndUpdate(userId, { refreshTokenHash: hash });
  }

  clearRefreshTokenHash(userId) {
    return User.findByIdAndUpdate(userId, { refreshTokenHash: null });
  }

  incrementFailedLogins(userId) {
    return User.findByIdAndUpdate(userId, { $inc: { failedLoginAttempts: 1 } }, { new: true }).select(
      '+failedLoginAttempts +lockUntil'
    );
  }

  lockAccount(userId, until) {
    return User.findByIdAndUpdate(userId, { lockUntil: until, failedLoginAttempts: 0 });
  }

  resetFailedLogins(userId) {
    return User.findByIdAndUpdate(userId, { failedLoginAttempts: 0, lockUntil: null });
  }

  addRole(userId, role) {
    return User.findByIdAndUpdate(userId, { $addToSet: { roles: role } }, { new: true });
  }
}

export default new UserRepository();