module.exports = class TaskPOJO {
  /**
   * @param {string} name
   * @param {boolean} completed
   * @param {string} dueDate
   */
  constructor(name, completed, dueDate) {
    this.name = name;
    this.completed = completed;
    this.dueDate = dueDate;
  }
};
