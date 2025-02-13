const sqlite = require("node:sqlite");
const path = require("node:path");

module.exports = class SQLiteDB {
  /** @type {DatabaseFramework} */
  static #instance;

  /** @type {sqlite.DatabaseSync} */
  #db;

  constructor() {
    if (SQLiteDB.#instance) return SQLiteDB.#instance;
    this.#db = new sqlite.DatabaseSync(
      path.join(__dirname, "..", "..", "db.sqlite"),
    );
    SQLiteDB.#instance = this;
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
   * Converts a database row to a TaskPOJO.
   * @param {{id: number, name: string, completed: boolean, dueDate: string | null}} row
   * @return {import("../entities/taskEntity").TaskPOJO}
   */
  #dbRowToTaskPojo(row) {
    return {
      id: row.id,
      name: row.name,
      completed: this.#getBoolFromInt(row.completed),
      dueDate: row.dueDate,
    };
  }

  /**
   * @param {import("../entities/taskEntity").TaskPOJO} taskPOJO
   * @returns {Promise<import("../use_cases/task_use_cases").TaskWithIDPOJO>}
   */
  async createTask(taskPOJO) {
    return new Promise((res, rej) => {
      try {
        const stmt = this.#db.prepare(
          "INSERT INTO task (name, completed, dueDate) VALUES (?, ?, ?) RETURNING *;",
        );
        const createdTask = stmt.get(
          taskPOJO.name,
          this.#getIntFromBool(taskPOJO.completed),
          taskPOJO.dueDate,
        );
        res(this.#dbRowToTaskPojo(createdTask));
      } catch (e) {
        rej(e);
      }
    });
  }

  /**
   * @param {string} name
   * @returns {Promise<?import("../use_cases/task_use_cases").TaskWithIDPOJO>}
   */
  async getTaskByName(name) {
    return new Promise((res, rej) => {
      try {
        const stmt = this.#db.prepare("SELECT * FROM task WHERE name = ?;");
        const dbTask = stmt.get(name);
        if (!dbTask) res(null);
        res(this.#dbRowToTaskPojo(dbTask));
      } catch (e) {
        rej(e);
      }
    });
  }

  /**
   * @param {string} dueDate
   * @returns {Promise<?import("../use_cases/task_use_cases").TaskWithIDPOJO>}
   */
  async getTaskByDueDate(dueDate) {
    return new Promise((res, rej) => {
      try {
        const stmt = this.#db.prepare("SELECT * FROM task WHERE dueDate = ?;");
        const task = stmt.get(dueDate);
        if (!task) res(null);
        res(this.#dbRowToTaskPojo(task));
      } catch (e) {
        rej(e);
      }
    });
  }

  /**
   * @param {number} taskID
   * @return {Promise<?import("./task_use_cases").TaskWithIDPOJO|null>}
   */
  async deleteTask(taskID) {
    return new Promise((res, rej) => {
      try {
        const stmt = this.#db.prepare(
          "DELETE FROM task WHERE id = ? RETURNING *;",
        );
        const task = stmt.get(taskID);
        if (!task) res(null);
        res(this.#dbRowToTaskPojo(task));
      } catch (e) {
        rej(e);
      }
    });
  }

  /**
   * @param {import("../use_cases/task_use_cases").FilterOptions} filterOptions
   * @returns {Promise<import("../use_cases/task_use_cases").TaskWithIDPOJO>}
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
    if (filterOptions.filter) {
      switch (filterOptions.filter.column) {
        case "name": {
          filterStmt = `WHERE name LIKE '%${filterOptions.filter.value}%'`;
          break;
        }
        case "completed": {
          filterStmt = `WHERE completed = ${this.#getIntFromBool(filterOptions.filter.value)}`;
          break;
        }
        case "dueDate": {
          filterStmt = `WHERE dueDate BETWEEN '${filterOptions.filter.value.from}' AND '${filterOptions.filter.value.to}'`;
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
        res(tasks.map((t) => this.#dbRowToTaskPojo(t)));
      } catch (e) {
        rej(e);
      }
    });
  }

  /**
   * @param {number} id
   * @param {import("../entities/taskEntity").TaskPOJO} newTask
   * @returns {Promise<import("../use_cases/task_use_cases").TaskWithIDPOJO>}
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
        res(this.#dbRowToTaskPojo(updatedTask));
      } catch (e) {
        rej(e);
      }
    });
  }
};
