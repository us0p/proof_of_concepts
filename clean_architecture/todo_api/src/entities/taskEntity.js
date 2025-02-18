const TaskEntityError = require("./taskEntity.error");

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
   * @param {string} name
   * @param {boolean} completed
   * @param {string} dueDate
   */
  validate() {
    if (!this.name) throw new TaskEntityError("'name' is a required field");
    if (typeof this.completed !== "boolean")
      throw new TaskEntityError("'completed' must be a boolean");

    !this.#isDueDateValid(this.dueDate);
  }

  /**
   * A task can be created without due date, but a task can't be created
   * for a past date.
   * @param {?string} dueDate
   */
  #isDueDateValid(dueDate) {
    if (dueDate === null) return;

    if (isNaN(new Date(dueDate)))
      throw new TaskEntityError(`Invalid dueDate '${dueDate}'`);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const dueDateAsDate = new Date(dueDate);
    dueDateAsDate.setUTCHours(0, 0, 0, 0);

    if (dueDateAsDate < today)
      throw new TaskEntityError(
        "Can't create a task with a dueDate in the past",
      );
  }

  /**
   * @param {number} id
   */
  setID(id) {
    this.id = id;
  }
};
