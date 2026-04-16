"use client";

import { useState, useEffect, useTransition } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { IconPlus, IconTrash, IconGripVertical, IconCalendar, IconUser } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { StatusBadge, UserAvatar } from "@/components/common";
import { updateTaskStatus, deleteTask } from "./actions";
import type { ProjectTask } from "./types";
import { STATUS_COLUMNS, PRIORITY_CONFIG } from "./types";

interface KanbanBoardProps {
  tasks: ProjectTask[];
  project: string;
  onAddTask: () => void;
  onEditTask?: (task: ProjectTask) => void;
}

export default function KanbanBoard({ tasks, project, onAddTask, onEditTask }: KanbanBoardProps) {
  const [isPending, startTransition] = useTransition();
  const [localTasks, setLocalTasks] = useState(tasks);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const columns = STATUS_COLUMNS.map((col) => ({
    ...col,
    tasks: localTasks
      .filter((t) => t.status === col.key)
      .sort((a, b) => a.sort_order - b.sort_order),
  }));

  function handleDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const taskId = Number(draggableId);
    const newStatus = destination.droppableId;
    const newOrder = destination.index;

    setLocalTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: newStatus as ProjectTask["status"], sort_order: newOrder } : t,
      ),
    );

    startTransition(async () => {
      await updateTaskStatus(taskId, newStatus, newOrder, project);
    });
  }

  function handleDelete(e: React.MouseEvent, taskId: number) {
    e.stopPropagation();
    setLocalTasks((prev) => prev.filter((t) => t.id !== taskId));
    startTransition(async () => {
      await deleteTask(taskId, project);
    });
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {columns.map((col) => (
          <div key={col.key} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className={cn("text-[10px] font-bold uppercase tracking-widest", col.color)}>
                  {col.label}
                </span>
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] bg-[var(--color-surface)] rounded-full w-5 h-5 flex items-center justify-center">
                  {col.tasks.length}
                </span>
              </div>
              {col.key === "request" && (
                <button type="button" onClick={onAddTask} className="p-1 rounded-[14px] text-[var(--color-text-muted)] hover:text-primary hover:bg-primary/10 transition-colors">
                  <IconPlus size={14} />
                </button>
              )}
            </div>

            <Droppable droppableId={col.key}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "min-h-[180px] rounded-[20px] p-1.5 transition-colors space-y-1.5",
                    snapshot.isDraggingOver ? "bg-primary/5 ring-1 ring-primary/20" : "bg-[var(--color-surface)]/30",
                  )}
                >
                  {col.tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "bg-[var(--color-surface)] rounded-[14px] border border-black/[0.04]/10 p-2.5 transition-shadow group",
                            snapshot.isDragging && "shadow-xl ring-1 ring-primary/30",
                          )}
                        >
                          <div className="flex items-start gap-1.5">
                            <div
                              {...provided.dragHandleProps}
                              className="mt-0.5 text-[var(--color-text-muted)]/30 hover:text-[var(--color-text-muted)] transition-colors cursor-grab active:cursor-grabbing"
                            >
                              <IconGripVertical size={12} />
                            </div>
                            <div
                              className="flex-1 min-w-0 cursor-pointer"
                              onClick={() => onEditTask?.(task)}
                            >
                              <p className="text-xs font-semibold text-[var(--color-text)] leading-snug line-clamp-2">
                                {task.title}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                <StatusBadge variant={PRIORITY_CONFIG[task.priority].variant}>
                                  {PRIORITY_CONFIG[task.priority].label}
                                </StatusBadge>
                                {task.due_date && (
                                  <span className="flex items-center gap-0.5 text-[9px] text-[var(--color-text-muted)]">
                                    <IconCalendar size={9} />
                                    {task.due_date.slice(5)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between mt-1.5">
                                {task.requester && !task.assignee && (
                                  <span className="text-[9px] text-tertiary">요청: {task.requester}</span>
                                )}
                                {task.assignee ? (
                                  <div className="flex items-center gap-1">
                                    <UserAvatar name={task.assignee} size="sm" className="!w-4 !h-4" />
                                    <span className="text-[9px] text-[var(--color-text-muted)]">{task.assignee}</span>
                                  </div>
                                ) : (
                                  !task.requester && <span />
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => handleDelete(e, task.id)}
                                  className="p-0.5 rounded text-[var(--color-text-muted)]/0 group-hover:text-[var(--color-text-muted)] hover:!text-error transition-colors"
                                >
                                  <IconTrash size={10} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}

                  {col.tasks.length === 0 && !snapshot.isDraggingOver && (
                    <div className="flex items-center justify-center py-6 text-[var(--color-text-muted)]/30">
                      <p className="text-[10px]">드래그하여 이동</p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
