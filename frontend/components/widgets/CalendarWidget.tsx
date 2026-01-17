"use client";

/**
 * Calendar Widget component
 * Displays today's scheduled events
 */

import { Calendar, MapPin, Clock } from "lucide-react";
import { Widget } from "./Widget";
import type { CalendarEvent } from "@/types";

interface CalendarWidgetProps {
  events: CalendarEvent[];
  isLoading?: boolean;
  error?: string;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function isEventPast(endTime: string): boolean {
  return new Date(endTime) < new Date();
}

export function CalendarWidget({ events, isLoading, error }: CalendarWidgetProps) {
  if (error) {
    return (
      <Widget
        title="Today's Schedule"
        icon={<Calendar className="w-4 h-4" />}
        className="min-w-[350px] w-full lg:w-[380px]"
      >
        <div className="text-center py-4">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </Widget>
    );
  }

  const upcomingEvents = events.filter((e) => !isEventPast(e.end));
  const pastEvents = events.filter((e) => isEventPast(e.end));

  return (
    <Widget isLoading={isLoading} className="min-w-[350px] w-full lg:w-[380px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-full bg-primary/10">
          <Calendar className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-medium text-foreground/80">Today&apos;s Schedule</span>
      </div>

      {/* Events list */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-foreground/50 text-sm">No events today</p>
          </div>
        ) : (
          <>
            {/* Upcoming events */}
            {upcomingEvents.map((event) => (
              <EventItem key={event.id} event={event} isPast={false} />
            ))}

            {/* Past events (dimmed) */}
            {pastEvents.map((event) => (
              <EventItem key={event.id} event={event} isPast={true} />
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      {events.length > 0 && (
        <p className="text-xs text-foreground/40 mt-3 text-center">
          {upcomingEvents.length === 0
            ? "No more events today"
            : `${upcomingEvents.length} upcoming`}
        </p>
      )}
    </Widget>
  );
}

function EventItem({ event, isPast }: { event: CalendarEvent; isPast: boolean }) {
  return (
    <div
      className={`
        p-3 rounded-lg border border-border/50 transition-opacity
        ${isPast ? "opacity-50" : "bg-background/50"}
      `}
    >
      <p className={`font-medium text-sm ${isPast ? "line-through" : ""} text-foreground`}>
        {event.title}
      </p>
      <div className="flex items-center gap-3 mt-1">
        <div className="flex items-center gap-1 text-xs text-foreground/60">
          <Clock className="w-3 h-3" />
          <span>
            {formatTime(event.start)} - {formatTime(event.end)}
          </span>
        </div>
        {event.location && (
          <div className="flex items-center gap-1 text-xs text-foreground/60">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{event.location}</span>
          </div>
        )}
      </div>
    </div>
  );
}
