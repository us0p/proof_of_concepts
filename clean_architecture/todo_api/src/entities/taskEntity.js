module.exports = class TaskEntity {
  /**
   * create a Task entity
   * @param {string} name
   * @param {boolean} [completed=false] - default to false.
   * @param {Date} [dueDate=null] - default to null.
   */
  constructor(name, completed = false, dueDate = null) {
    this.name = name;
    this.completed = completed;
    this.dueDate = dueDate;
  }

  /**
   * Validates due date.
   * A task can be created without due date, but a task can't be created
   * for a past date.
   * @retusn {boolean}
   */
  isDueDateValid() {
    if (!this.dueDate) return true;
    const now = new Date();
    if (this.dueDate >= now) return true;
    return false;
  }
};
