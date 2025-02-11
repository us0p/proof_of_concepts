const express = require("express");
const SQLiteDB = require("./src/database/db.framework");
const TaskUseCases = require("./src/use_cases/task_use_cases");
const TaskController = require("./src/controllers/task/task.controller");
const app = express();

app.use(express.json());

const db = new SQLiteDB();
const taskUsecase = new TaskUseCases(db);
const taskController = new TaskController(taskUsecase);

app.post("/task", async (req, res) => {
  try {
    const apiResponse = await taskController.createTask(req.body);
    return res.status(apiResponse.statusCode).json(apiResponse.data).end();
  } catch (e) {
    return res.status(500).json({ message: e.message }).end();
  }
});

app.delete("/task/:id", async (req, res) => {
  try {
    const apiResponse = await taskController.deleteTask(
      parseInt(req.params.id),
    );
    return res.status(apiResponse.statusCode).json(apiResponse.data).end();
  } catch (e) {
    return res.status(500).json({ message: e.message }).end();
  }
});

app.put("/task/:id", async (req, res) => {
  try {
    const apiResponse = await taskController.updateTask(
      parseInt(req.params.id),
      req.body,
    );
    return res.status(apiResponse.statusCode).json(apiResponse.data).end();
  } catch (e) {
    return res.status(500).json({ message: e.message }).end();
  }
});

app.listen(5000, () => {
  console.log("server listening on port 5000");
});
