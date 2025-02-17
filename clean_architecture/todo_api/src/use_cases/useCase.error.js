module.exports = class UseCaseError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(message);
  }
};
