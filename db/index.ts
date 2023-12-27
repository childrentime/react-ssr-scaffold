import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

// 初始化待办事项列表
let todos: TodoItem[] = [
  {
    id: "1",
    text: "test",
    completed: false,
  },
];

const app = express();
app.use(bodyParser.json());

// 获取所有待办事项
app.get("/api/todos", (req: Request, res: Response) => {
  res.json(todos);
});

// 创建新的待办事项
app.post("/api/todos", (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text) {
    res.status(400).json({ message: "Text is required" });
    return;
  }
  const todo: TodoItem = { id: uuidv4(), text, completed: false };
  todos.push(todo);
  res.json(todo);
});

// 更新待办事项
app.put("/api/todos/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const { completed } = req.body;
  const todo = todos.find((item) => item.id === id);
  if (!todo) {
    res.status(404).json({ message: "Todo Item not found" });
    return;
  }
  todo.completed = completed;
  res.json(todo);
});

// 删除待办事项
app.delete("/api/todos/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const index = todos.findIndex((item) => item.id === id);
  if (index === -1) {
    res.status(404).json({ message: "Todo Item not found" });
    return;
  }
  const deletedItem = todos.splice(index, 1);
  res.json(deletedItem[0]);
});

const port = 8080;
app.listen(port, () => console.log(`Server started on port ${port}`));
