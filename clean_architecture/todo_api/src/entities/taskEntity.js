/**
 * @typedef {Object} TaskPOJO
 * @property {string} name
 * @property {boolean} completed
 * @property {string} dueDate
 */

module.exports = class TaskEntity {
  /**
   * create a Task entity
   * @param {string} name
   * @param {boolean} [completed=false] - default to false.
   * @param {string} [dueDate=null] - default to null.
   */
  constructor(name, completed = false, dueDate = null) {
    this.name = name;
    this.completed = completed;
    this.dueDate = dueDate;
  }

  /**
   * Validates if current Entity is in a valid format
   * @returns {boolean}
   */
  isEntityValid() {
    if (!this.name) return false;
    if (!this.isDueDateValid()) return false;
    if (typeof this.completed !== "boolean") return false;
    return true;
  }

  /**
   * A task can be created without due date, but a task can't be created
   * for a past date.
   * @returns {boolean}
   */
  isDueDateValid() {
    if (this.dueDate === null) return true;

    const dueDate = new Date(this.dueDate);
    if (dueDate.toString() === "Invalid Date") return false;

    const now = new Date();
    if (dueDate >= now) return true;
    return false;
  }

  /**
   * Produces a POJO from the class properties
   * @returns {TaskPOJO}
   */
  getPublicData() {
    return {
      name: this.name,
      completed: this.completed,
      dueDate: this.dueDate ? new Date(this.dueDate).toISOString() : null,
    };
  }
};
