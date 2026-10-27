import { PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { usePersistentState } from "@/lib/storage";

type Todo = { id: string; text: string; done: boolean };

export function Example() {
  const [todos, setTodos, ready] = usePersistentState<Todo[]>("todos", []);
  const [text, setText] = useState("");
  const left = todos.filter((t) => !t.done).length;

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setTodos([...todos, { id: crypto.randomUUID(), text: text.trim(), done: false }]);
    setText("");
  };

  const update = (id: string, patch: Partial<Todo>) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Todo list</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={add} className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs to be done?"
            className="h-12 text-base md:text-base"
          />
          <Button type="submit" size="lg">
            <PlusIcon /> Add
          </Button>
        </form>
        <ul className="divide-y">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center gap-3 py-2">
              <Checkbox
                checked={todo.done}
                onCheckedChange={(done) => update(todo.id, { done })}
                aria-label={todo.text}
                className="size-5"
              />
              <span className={todo.done ? "text-muted-foreground flex-1 line-through" : "flex-1"}>{todo.text}</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete"
                onClick={() => setTodos(todos.filter((t) => t.id !== todo.id))}
              >
                <Trash2Icon />
              </Button>
            </li>
          ))}
          {ready && !todos.length && <li className="text-muted-foreground py-6 text-center">Nothing to do 🎉</li>}
        </ul>
      </CardContent>
      {todos.length > 0 && (
        <CardFooter className="justify-between border-t pb-4">
          <span className="text-muted-foreground text-sm">{left} left</span>
          <Button variant="ghost" onClick={() => setTodos(todos.filter((t) => !t.done))}>
            Clear completed
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
