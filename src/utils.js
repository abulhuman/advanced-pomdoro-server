const { AuthenticationError } = require('apollo-server-express');
function getUserId(req) {
  const { userId } = req.session;
  if (userId)
      return userId
  throw new AuthenticationError('User not found')
}

module.exports = {
  getUserId
};
