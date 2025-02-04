module.exports = class TaskUseCaseError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(message);
  }
};
