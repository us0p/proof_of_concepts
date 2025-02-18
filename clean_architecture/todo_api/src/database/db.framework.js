const sqlite = require("node:sqlite");
const path = require("node:path");
const ITaskRepository = require("../entities/interfaces/task.repository");
const TaskEntity = require("../entities/taskEntity");
const TaskFilterOptions = require("../entities/taskFilter");

module.exports = class TaskRepository extends ITaskRepository {
  /** @type {TaskRepository} */
  static #instance;

  /** @type {sqlite.DatabaseSync} */
  #db;

  constructor() {
    super();
    if (TaskRepository.#instance) return TaskRepository.#instance;
    this.#db = new sqlite.DatabaseSync(
      path.join(__dirname, "..", "..", "db.sqlite"),
    );
    TaskRepository.#instance = this;
  }

  /**
   * Convert bool to integer
   * @param {boolean} bool
   * @returns {number}
   */
  #getIntFromBool(bool) {
    return bool ? 1 : 0;
  }

  /**
   * Convert integer to boolean
   * @param {number} int
   * @returns {boolean}
   */
  #getBoolFromInt(int) {
    return int ? true : false;
  }

  /**
   * Converts a database row to a TaskEntity.
   * @param {{id: number, name: string, completed: boolean, dueDate: string | null}} row
   * @return {TaskEntity}
   */
  #dbRowToTaskEntity(row) {
    const task = new TaskEntity(
      row.name,
      this.#getBoolFromInt(row.completed),
      row.dueDate,
    );
    task.setID(row.id);
    return task;
  }

  /**
   * @param {TaskEntity} task
   * @returns {Promise<TaskEntity>}
   */
  async createTask(task) {
    return new Promise((res, rej) => {
      try {
        const stmt = this.#db.prepare(
          "INSERT INTO task (name, completed, dueDate) VALUES (?, ?, ?) RETURNING *;",
        );
        const createdTask = stmt.get(
          task.name,
          this.#getIntFromBool(task.completed),
          task.dueDate,
        );

        res(this.#dbRowToTaskEntity(createdTask));
      } catch (e) {
        rej(e);
      }
    });
  }

  /**
   * @param {string} name
   * @returns {Promise<?TaskEntity>}
   */
  async getTaskByName(name) {
    return new Promise((res, rej) => {
      try {
        const stmt = this.#db.prepare("SELECT * FROM task WHERE name = ?;");
        const dbTask = stmt.get(name);
        if (!dbTask) res(null);
        res(this.#dbRowToTaskEntity(dbTask));
      } catch (e) {
        rej(e);
      }
    });
  }

  /**
   * @param {string} dueDate
   * @returns {Promise<?TaskEntity>}
   */
  async getTaskByDueDate(dueDate) {
    return new Promise((res, rej) => {
      try {
        const stmt = this.#db.prepare("SELECT * FROM task WHERE dueDate = ?;");
        const task = stmt.get(dueDate);
        if (!task) res(null);
        res(this.#dbRowToTaskEntity(task));
      } catch (e) {
        rej(e);
      }
    });
  }

  /**
   * @param {number} taskID
   * @return {Promise<?TaskEntity>}
   */
  async deleteTask(taskID) {
    return new Promise((res, rej) => {
      try {
        const stmt = this.#db.prepare(
          "DELETE FROM task WHERE id = ? RETURNING *;",
        );
        const task = stmt.get(taskID);
        if (!task) res(null);
        res(this.#dbRowToTaskEntity(task));
      } catch (e) {
        rej(e);
      }
    });
  }

  /**
   * @param {TaskFilterOptions} filterOptions
   * @returns {Promise<TaskEntity[]>}
   */
  async listTasks(filterOptions) {
    let orderStmt = "";
    if (filterOptions.orderBy) {
      let columns = "";
      for (const order of filterOptions.orderBy) {
        columns += ` ${order.column} ${order.decreasing ? "DESC" : "ASC"},`;
      }
      orderStmt = `ORDER BY ${columns.slice(0, columns.length - 1)}`;
    }

    let filterStmt = "";
    if (filterOptions.filterBy) {
      switch (filterOptions.filterBy.column) {
        case "name": {
          filterStmt = `WHERE name LIKE '%${filterOptions.filterBy.value}%'`;
          break;
        }
        case "completed": {
          filterStmt = `WHERE completed = ${this.#getIntFromBool(filterOptions.filterBy.value)}`;
          break;
        }
        case "dueDate": {
          filterStmt = `WHERE dueDate BETWEEN '${filterOptions.filterBy.value.from}' AND '${filterOptions.filterBy.value.to}'`;
          break;
        }
      }
    }

    return new Promise((res, rej) => {
      try {
        const stmt = this.#db.prepare(
          `SELECT * FROM task ${filterStmt} ${orderStmt};`,
        );
        const tasks = stmt.all();
        res(tasks.map((t) => this.#dbRowToTaskEntity(t)));
      } catch (e) {
        rej(e);
      }
    });
  }

  /**
   * @param {number} id
   * @param {TaskEntity} newTask
   * @returns {Promise<?TaskEntity>}
   */
  async updateTask(id, newTask) {
    return new Promise((res, rej) => {
      try {
        const getStmt = this.#db.prepare("SELECT * FROM task WHERE id = ?;");
        const task = getStmt.get(id);
        if (!task) res(null);
        Object.assign(task, newTask);
        task.completed = this.#getIntFromBool(task.completed);
        const updateStmt = this.#db.prepare(
          "UPDATE task SET name = ?, completed = ?, dueDate = ? WHERE id = ? RETURNING *;",
        );
        const updatedTask = updateStmt.get(
          task.name,
          task.completed,
          task.dueDate,
          id,
        );
        res(this.#dbRowToTaskEntity(updatedTask));
      } catch (e) {
        rej(e);
      }
    });
  }
};
