const ITaskRepository = require("../../entities/interfaces/task.repository");
const TaskDTO = require("../interfaces/task.dto");

module.exports = class ListTasksUseCase {
  /**
   * @param {ITaskRepository} repo
   */
  constructor(repo) {
    this.repo = repo;
  }

  /**
   * @param {import("../../entities/interfaces/task.repository").FilterOptions} filterOptions
   * @returns {Promise<TaskDTO[]>}
   */
  async execute(filterOptions) {
    const tasks = await this.repo.listTasks(filterOptions);
    return tasks.map((t) => TaskDTO.fromEntity(t));
  }
};
