const express = require("express");
const app = express();

app.use(express.json());

const TaskRepository = require("./src/database/db.framework");
const TaskController = require("./src/controllers/task/task.controller");
const CreateTaskUseCase = require("./src/use_cases/createTask/createTask.usecase");
const DeleteTaskUseCase = require("./src/use_cases/deleteTask/deleteTask.usecase");
const UpdateTaskUseCase = require("./src/use_cases/updateTask/updateTask.usecase");
const ListTasksUseCase = require("./src/use_cases/listTasks/listTask.usecase");

const taskRepository = new TaskRepository();
const taskController = new TaskController();

app.post("/task", async (req, res) => {
  const createTaskUseCase = new CreateTaskUseCase(taskRepository);
  const apiResponse = await taskController.createTask(
    createTaskUseCase,
    req.body,
  );
  return res.status(apiResponse.statusCode).json(apiResponse.data).end();
});

app.delete("/task/:id", async (req, res) => {
  const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);
  const apiResponse = await taskController.deleteTask(
    deleteTaskUseCase,
    parseInt(req.params.id),
  );
  return res.status(apiResponse.statusCode).json(apiResponse.data).end();
});

app.put("/task/:id", async (req, res) => {
  const updateTaskUseCase = new UpdateTaskUseCase(taskRepository);
  const apiResponse = await taskController.updateTask(
    updateTaskUseCase,
    parseInt(req.params.id),
    req.body,
  );
  return res.status(apiResponse.statusCode).json(apiResponse.data).end();
});

app.get("/task", async (req, res) => {
  const listTasksUseCase = new ListTasksUseCase(taskRepository);
  const apiResponse = await taskController.listTasks(listTasksUseCase, {
    order: req.query.order,
    filter: req.query.filter,
  });
  return res.status(apiResponse.statusCode).json(apiResponse.data).end();
});

app.listen(5000, () => {
  console.log("server listening on port 5000");
});
