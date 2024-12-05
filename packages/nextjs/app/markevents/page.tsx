"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";


const MarkEvents = () => {
    const [formVisible, setFormVisible] = useState(false);
    const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [locationName, setLocationName] = useState("");
    const [showLocationModal, setShowLocationModal] = useState(true);
    const [formData, setFormData] = useState({
      eventType: "",
      organizer: "",
      timeFrom: "",
      timeTo: "",
      date: "",
      foodTypes: "",
      location: "",
    });
  
    const router = useRouter();
    const { writeContractAsync } = useScaffoldWriteContract("EventStorage");
      const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);

          // Reverse geocoding to get the location name
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const location = data.display_name || "Unknown Location";
          setLocationName(location);

          // Autofill the location in the form
          setFormData((prev) => ({
            ...prev,
            location: location,
          }));

          setShowLocationModal(false);
          setFormVisible(true);
          toast.success("Location accessed successfully!");
        },
        (error) => {
          toast.error("Unable to retrieve your location.");
          setShowLocationModal(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
      setShowLocationModal(false);
    }
  };

  const resetForm = () => {
    setFormVisible(false);
    setMarkerPosition(null);
    setFormData({
      eventType: "",
      organizer: "",
      timeFrom: "",
      timeTo: "",
      date: "",
      foodTypes: "",
      location: "",
    });
  };
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setMarkerPosition([e.latlng.lat, e.latlng.lng]);
        setFormVisible(true);
        // Reverse geocoding after clicking to set the location name
        fetchLocationName(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  const fetchLocationName = async (lat: number, lon: number) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );
    const data = await res.json();
    setLocationName(data.display_name || "Unknown Location");

    // Autofill the location in the form
    setFormData((prev) => ({
      ...prev,
      location: data.display_name || "Unknown Location",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
        const fullFromDateTime = new Date(`${formData.date}T${formData.timeFrom}`);
        const fullToDateTime = new Date(`${formData.date}T${formData.timeTo}`);
    
        // Convert to Unix timestamp in seconds
        const timeFromUnix = BigInt(Math.floor(fullFromDateTime.getTime() / 1000));
        const timeToUnix = BigInt(Math.floor(fullToDateTime.getTime() / 1000));
        const dateUnix = BigInt(Math.floor(fullFromDateTime.getTime() / 1000));

      // Call smart contract to create event
      await writeContractAsync({
        functionName: "createEvent",
        args: [
          formData.eventType,
          formData.location,
          timeFromUnix,
          timeToUnix,
          dateUnix,
          formData.foodTypes
        ] as [string, string, bigint, bigint, bigint, string],
      });
  
      toast.success("Event successfully submitted to blockchain!");
      resetForm();
      console.log(formData, "Event successfully submitted to blockchain!");
      // Redirect to /viewevent after submission
      router.push("/viewevents");
    } catch (error) {
      console.error("Error submitting event:", error);
      toast.error("Failed to submit event to blockchain");
    }
  };
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="h-screen flex flex-col relative">
      {showLocationModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center">
            <h2 className="text-2xl font-bold mb-4 text-black">Allow Location Access</h2>
            <p className="mb-6 text-black">Enable location to mark events on the map</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={requestLocation}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Enable Location
              </button>
              <button
                onClick={() => setShowLocationModal(false)}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-center text-2xl font-bold py-4">Mark an Event</h1>
      <div className="flex-grow">
        <MapContainer
          center={userLocation || [20.5937, 78.9629]}
          zoom={6}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler />
          {userLocation && (
            <Marker position={userLocation}>
              <Popup>Your current location</Popup>
            </Marker>
          )}
          {markerPosition && (
            <Marker position={markerPosition}>
              <Popup>{locationName}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {formVisible && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-white p-6 shadow-lg rounded-lg w-96">
          <h2 className="text-xl font-semibold mb-4">Event Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="eventType"
              placeholder="Event Type"
              value={formData.eventType}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              name="organizer"
              placeholder="Organizer"
              value={formData.organizer}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
            <div className="flex space-x-2">
              <input
                type="time"
                name="timeFrom"
                placeholder="Time From"
                value={formData.timeFrom}
                onChange={handleInputChange}
                className="flex-1 p-2 border rounded"
                required
              />
              <input
                type="time"
                name="timeTo"
                placeholder="Time To"
                value={formData.timeTo}
                onChange={handleInputChange}
                className="flex-1 p-2 border rounded"
                required
              />
            </div>
            <input
              type="date"
              name="date"
              placeholder="Date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              name="foodTypes"
              placeholder="Food Types"
              value={formData.foodTypes}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              readOnly
              className="w-full p-2 border rounded b"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg shadow hover:bg-blue-700"
            >
              Submit
            </button>
          </form>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default MarkEvents;
