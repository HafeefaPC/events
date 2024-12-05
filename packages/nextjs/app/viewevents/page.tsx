"use client";
import { useState, useEffect } from 'react';
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface EventDetails {
  id: string;
  organizer: string;
  eventType: string;
  location: string;
  timeFrom: bigint;
  timeTo: bigint;
  date: bigint;
  foodTypes: string;
}

export default function ViewEvents() {
  const [events, setEvents] = useState<EventDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all event IDs
  const {
    data: eventIds,
    isLoading: isLoadingIds
  } = useScaffoldReadContract({
    contractName: "EventStorage",
    functionName: "getAllEventIds",
  });

  // Fetch individual event details
  useEffect(() => {
    const fetchEvents = async () => {
      if (eventIds && eventIds.length > 0) {
        try {
          const processedEvents: EventDetails[] = await Promise.all(
            eventIds.map(async (eventId) => {
              const event = await readContract({
                contractName: "EventStorage",
                functionName: "getEvent",
                args: [eventId],
              });

              return {
                id: eventId,
                organizer: event.organizer,
                eventType: event.eventType,
                location: event.location,
                timeFrom: event.timeFrom,
                timeTo: event.timeTo,
                date: event.date,
                foodTypes: event.foodTypes,
              };
            })
          );

          setEvents(processedEvents);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching events:", error);
          setIsLoading(false);
        }
      } else if (eventIds && eventIds.length === 0) {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [eventIds]);

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const formatTime = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleTimeString();
  };

  if (isLoading || isLoadingIds) {
    return <div className="text-center py-10">Loading events...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Registered Events</h1>
      {events.length === 0 ? (
        <p className="text-center text-gray-500">No events registered yet</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white shadow-lg rounded-lg p-6 border hover:shadow-xl transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-4">{event.eventType}</h2>
              <div className="space-y-2">
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Date:</strong> {formatDate(event.date)}</p>
                <p><strong>Time:</strong> {formatTime(event.timeFrom)} - {formatTime(event.timeTo)}</p>
                <p><strong>Food Types:</strong> {event.foodTypes}</p>
                <p><strong>Organizer:</strong> {event.organizer}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}