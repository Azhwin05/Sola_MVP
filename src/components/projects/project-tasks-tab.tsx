"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { TASK_STATUSES, TASK_STATUS_LABELS, TASK_PRIORITIES, type TaskStatus, type TaskPriority } from "@/lib/projects/constants";
import type { TaskRow } from "@/components/projects/types";

export function ProjectTasksTab({
  projectId,
  tasks,
  profiles,
  canManage,
}: {
  projectId: string;
  tasks: TaskRow[];
  profiles: { id: string; full_name: string }[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const today = new Date(new Date().toDateString());

  async function moveTask(taskId: string, status: TaskStatus) {
    const supabase = createClient();
    const { error } = await supabase.from("project_tasks").update({ status }).eq("id", taskId);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        {canManage && (
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        )}
      </div>

      {tasks.length === 0 ? (
        <EmptyState icon={ListTodo} title="No tasks yet" description="Break the project into tasks with owners and due dates." />
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {TASK_STATUSES.map((status) => {
            const columnTasks = tasks.filter((t) => t.status === status);
            return (
              <div key={status} className="w-64 shrink-0">
                <div className="mb-2 flex items-center justify-between px-1">
                  <h3 className="text-xs font-semibold text-foreground">{TASK_STATUS_LABELS[status]}</h3>
                  <span className="text-xs text-muted-foreground">{columnTasks.length}</span>
                </div>
                <div className="min-h-24 space-y-2 rounded-lg bg-muted/40 p-2">
                  {columnTasks.map((task) => {
                    const overdue = task.due_date && new Date(task.due_date) < today && !["done", "cancelled"].includes(task.status);
                    return (
                      <div key={task.id} className="rounded-md border border-border bg-card p-2.5 shadow-sm">
                        <p className="text-sm font-medium text-foreground">{task.title}</p>
                        <div className="mt-1 flex items-center justify-between gap-1">
                          <Badge variant={task.priority === "high" ? "destructive" : "secondary"} className="text-[10px]">
                            {task.priority}
                          </Badge>
                          {task.due_date && (
                            <span className={`text-xs ${overdue ? "font-medium text-destructive" : "text-muted-foreground"}`}>
                              {new Date(task.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </span>
                          )}
                        </div>
                        {task.owner && <p className="mt-1 text-xs text-muted-foreground">{task.owner.full_name}</p>}
                        {canManage && (
                          <Select value={task.status} onValueChange={(v) => v && moveTask(task.id, v as TaskStatus)}>
                            <SelectTrigger size="sm" className="mt-2 w-full text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TASK_STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {TASK_STATUS_LABELS[s]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddTaskDialog projectId={projectId} profiles={profiles} open={dialogOpen} onOpenChange={setDialogOpen} onCreated={() => router.refresh()} />
    </div>
  );
}

function AddTaskDialog({
  projectId,
  profiles,
  open,
  onOpenChange,
  onCreated,
}: {
  projectId: string;
  profiles: { id: string; full_name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [ownerId, setOwnerId] = useState("none");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("project_tasks").insert({
      project_id: projectId,
      title: title.trim(),
      owner_id: ownerId === "none" ? null : ownerId,
      priority,
      due_date: dueDate || null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setTitle("");
    setDueDate("");
    onOpenChange(false);
    onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add task</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Owner</Label>
              <Select value={ownerId} onValueChange={(v) => v && setOwnerId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => v && setPriority(v as TaskPriority)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="due_date">Due date</Label>
            <Input id="due_date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={save} disabled={saving || !title.trim()}>
            {saving ? "Adding…" : "Add task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
