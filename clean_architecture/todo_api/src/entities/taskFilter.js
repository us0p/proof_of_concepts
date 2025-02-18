const TaskFilterOptionError = require("./taskFilter.error");

/**
 * @typedef {Object} FilterParams
 * @property {string} [filter = undefined]
 * @property {string} [order = undefined]
 */

module.exports = class TaskFilterOptions {
  /**
   * @param {FilterParams} filterParams
   */
  constructor(filterParams) {
    this.orderBy = this.#buildOrdering(filterParams.order);
    this.filterBy = this.#buildFiltering(filterParams.filter);
  }

  /**
   * @param {string} [order]
   * @returns {import("./interfaces/task.repository").OrderBy | undefined}
   */
  #buildOrdering(order) {
    if (!order) return;

    const ordering = order.split(";");
    const orderBy = ordering.map((ord) => {
      const [column, ordering] = ord.split(",");
      if (!["name", "completed", "dueDate"].includes(column))
        throw new TaskFilterOptionError(`Invalid column '${column}'`);
      const orderBy = { column };
      if (ordering?.toUpperCase() === "DESC") orderBy.decreasing = true;
      return orderBy;
    });
    return orderBy;
  }

  /**
   * @param {string} [filter]
   * @returns {import("./interfaces/task.repository").FilterBy | undefined|
   */
  #buildFiltering(filter) {
    if (!filter) return;
    const filterBy = {};
    const [column, value] = filter.split(",");
    switch (column.toLowerCase()) {
      case "name": {
        filterBy.column = "name";
        filterBy.value = value;
        break;
      }
      case "completed": {
        if (value !== "true" && value !== "false") {
          throw new TaskFilterOptionError(
            "'completed' column must be a boolean",
          );
        }
        filterBy.column = "completed";
        filterBy.value = value === "true" ? true : false;
        break;
      }
      case "duedate": {
        const [start, end] = value.split(";");
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (isNaN(startDate) || isNaN(endDate))
          throw new TaskFilterOptionError(`Invalid range '${value}'`);

        if (endDate < startDate)
          throw new TaskFilterOptionError("Start date can't be after end");

        filterBy.column = "dueDate";
        filterBy.value = {
          from: startDate.toISOString(),
          to: endDate.toISOString(),
        };
        break;
      }
      default: {
        throw new TaskFilterOptionError(`Invalid column '${column}'`);
      }
    }

    return filterBy;
  }
};
