'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';

const defaultPosition: [number, number] = [32.7157, -117.1611]; // SD

interface Spot {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  description?: string;
  images?: { id: string; url: string }[];
}

export default function MapClient() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [selected, setSelected] = useState<Spot | null>(null);
  const [newPinCoords, setNewPinCoords] = useState<[number, number] | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/spots")
      .then(res => res.json())
      .then(data => setSpots(data.spots));
  }, []);

  function ClickHandler() {
    useMapEvents({
      click(e) {
        setNewPinCoords([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  }

  const handleDeleteImage = async (spotId: string, imageId?: string) => {
    if (!imageId) return alert("Missing image ID");
    const res = await fetch(`/api/spots/${spotId}/upload/${imageId}`, { method: 'DELETE' });
    if (res.ok) {
      setSpots(prev =>
        prev.map(s =>
          s.id === spotId
            ? { ...s, images: s.images?.filter(i => i.id !== imageId) }
            : s
        )
      );
    }
  };

  return (
    <div className="h-screen w-full relative bg-black">
      <MapContainer
        center={defaultPosition}
        zoom={10}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            position={[spot.latitude, spot.longitude]}
            eventHandlers={{
              click: () => setSelected(spot),
            }}
          />
        ))}
        <ClickHandler />
        {newPinCoords && (
          <Marker
            position={newPinCoords}
            icon={L.icon({
              iconUrl: "/custom-icons/marker-icon.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })}
          />
        )}
      </MapContainer>

      {/* Spot Info Modal */}
      {selected && (
        <div className="absolute bottom-4 left-4 bg-white text-black p-4 rounded shadow-md z-10 max-w-md">
          <h2 className="text-xl font-bold">{selected.title}</h2>
          <p className="text-sm">{selected.description}</p>

          {/* Existing images */}
          <div className="flex flex-wrap gap-2 mt-2">
            {selected.images?.map((img) => (
              <div key={img.id || img.url} className="relative">
                <img src={img.url} alt="" className="w-24 h-24 object-cover rounded" />
                <button
                  className="absolute top-0 right-0 text-xs bg-red-600 text-white px-1 rounded"
                  onClick={() => handleDeleteImage(selected.id, img.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Upload form */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              const input = e.currentTarget.elements.namedItem("file") as HTMLInputElement;
              if (!input) {
                alert("No file input found");
                return;
              }

              const files = input.files;
              if (!files || !selected?.id) {
                alert("No files selected or spot not selected");
                return;
              }

              for (let file of Array.from(files)) {
                const formData = new FormData();
                formData.append("file", file);

                const res = await fetch(`/api/spots/${selected.id}/upload`, {
                  method: "POST",
                  body: formData,
                });

                if (!res.ok) {
                  console.error("Image upload failed:", await res.text());
                  alert("Failed to upload image");
                  continue;
                }

                const { url, id } = await res.json();
                setSpots(prev =>
                  prev.map(s =>
                    s.id === selected.id
                      ? {
                          ...s,
                          images: [...(s.images || []), { url, id }]
                        }
                      : s
                  )
                );
              }

              setPreviews([]);
              input.value = "";
            }}
          >
            <label className="block mt-4 w-full p-4 border-2 border-dashed border-gray-400 rounded text-center cursor-pointer bg-gray-100 text-gray-600">
              Drag & drop or click to upload
              <input
                type="file"
                name="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    const urls = Array.from(files).map(f => URL.createObjectURL(f));
                    setPreviews(urls);
                  }
                }}
              />
            </label>
            <div className="flex gap-2 mt-2 flex-wrap">
              {previews.map((url, i) => (
                <img key={i} src={url} alt={`Preview ${i + 1}`} className="w-24 h-24 object-cover rounded" />
              ))}
            </div>
            <button className="bg-blue-600 text-white mt-2 px-4 py-1 rounded w-full" type="submit">
              Upload Image(s)
            </button>
          </form>
          <button
            onClick={async () => {
              const res = await fetch(`/api/spots/${selected.id}`, { method: 'DELETE' });
              if (res.ok) {
                setSpots(prev => prev.filter(spot => spot.id !== selected.id));
                setSelected(null);
              } else {
                alert('Failed to delete the spot');
              }
            }}
            className="bg-red-600 text-white mt-4 px-4 py-2 rounded"
          >
            Delete Spot
          </button>
          <button onClick={() => setSelected(null)} className="text-red-500 mt-4 block">
            Close
          </button>
        </div>
      )}

      {/* New Pin Modal */}
      {newPinCoords && (
        <div className="absolute bottom-4 right-4 bg-white text-black p-4 rounded shadow-md z-10 max-w-md">
          <input
            type="number"
            name="latitude"
            value={newPinCoords[0]}
            step="0.0001"
            onChange={(e) =>
              setNewPinCoords([parseFloat(e.target.value), newPinCoords[1]])
            }
            className="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="number"
            name="longitude"
            value={newPinCoords[1]}
            step="0.0001"
            onChange={(e) =>
              setNewPinCoords([newPinCoords[0], parseFloat(e.target.value)])
            }
            className="w-full p-2 border rounded mb-2"
            required
          />
          <h2 className="text-lg font-semibold">Add New Spot</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);

              const data = {
                title: formData.get("title") as string,
                description: formData.get("description") as string,
                latitude: newPinCoords[0],
                longitude: newPinCoords[1],
                visitedAt: new Date().toISOString(),
              };

              const res = await fetch("/api/spots", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });

              if (res.ok) {
                const form = e.currentTarget as HTMLFormElement;
                form.reset(); // ✅ safely reset before unmounting the modal
                const { spot } = await res.json();
                setSpots((prev) => [...prev, spot]);
                setNewPinCoords(null); // ✅ unmount afterward
              }              
            }}
          >
            <input
              type="text"
              name="title"
              placeholder="Title"
              required
              className="w-full p-2 border rounded mb-2"
            />
            <textarea
              name="description"
              placeholder="Description"
              className="w-full p-2 border rounded mb-2"
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
              Save Spot
            </button>
          </form>
          <button onClick={() => setNewPinCoords(null)} className="text-sm text-red-500 mt-2">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
