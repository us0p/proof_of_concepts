const ITaskRepository = require("../../entities/interfaces/task.repository");

const TaskDTO = require("../interfaces/task.dto");

module.exports = class DeleteTaskUseCase {
  /**
   * @param {ITaskRepository} repo
   */
  constructor(repo) {
    this.repo = repo;
  }

  /**
   * @param {number} taskID
   * @returns {Promise<?TaskDTO>}
   */
  async execute(taskID) {
    const deletedTask = await this.repo.deleteTask(taskID);
    return deletedTask ? TaskDTO.fromEntity(deletedTask) : null;
  }
};
