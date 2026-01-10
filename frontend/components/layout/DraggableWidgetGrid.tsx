"use client";

/**
 * Draggable Widget Grid component
 * Enables drag and drop reordering of widgets using @dnd-kit
 */

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils/cn";
import { useEditMode } from "./EditModeProvider";

interface DraggableWidgetGridProps {
  items: string[];
  onReorder: (items: string[]) => void;
  children: React.ReactNode;
  renderItem: (id: string) => React.ReactNode;
}

export function DraggableWidgetGrid({
  items,
  onReorder,
  renderItem,
}: DraggableWidgetGridProps) {
  const { isEditMode } = useEditMode();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      const newItems = arrayMove(items, oldIndex, newIndex);
      onReorder(newItems);
    }
  };

  // Use different strategies based on screen size
  // For simplicity, using horizontal on larger screens
  const sortingStrategy = horizontalListSortingStrategy;

  if (!isEditMode) {
    // Non-edit mode: render without drag functionality
    return (
      <div
        className={cn(
          "grid grid-cols-1 gap-4",
          "sm:grid-cols-2",
          "lg:flex lg:flex-row lg:overflow-x-auto lg:gap-4 lg:pb-4"
        )}
      >
        {items.map((id) => (
          <div key={id} className="lg:flex-shrink-0">
            {renderItem(id)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={sortingStrategy}>
        <div
          className={cn(
            "grid grid-cols-1 gap-4",
            "sm:grid-cols-2",
            "lg:flex lg:flex-row lg:overflow-x-auto lg:gap-4 lg:pb-4"
          )}
        >
          {items.map((id) => (
            <SortableWidget key={id} id={id}>
              {renderItem(id)}
            </SortableWidget>
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <div className="opacity-80 shadow-2xl">{renderItem(activeId)}</div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

interface SortableWidgetProps {
  id: string;
  children: React.ReactNode;
}

function SortableWidget({ id, children }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "lg:flex-shrink-0 relative",
        isDragging && "opacity-50 z-50"
      )}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}
