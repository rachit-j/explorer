'use client';

import { useState, useEffect } from 'react';

interface Spot {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  description: string;
}

export default function SpotsCrudPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [editing, setEditing] = useState<Spot | null>(null);
  const [formData, setFormData] = useState<Spot>({
    id: '',
    title: '',
    latitude: 0,
    longitude: 0,
    description: '',
  });

  // Fetch spots on page load
  useEffect(() => {
    fetch('/api/spots')
      .then((res) => res.json())
      .then((data) => setSpots(data.spots));
  }, []);

  // Handle input changes in the form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle submit for adding or updating spots
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? 'PATCH' : 'POST';
    const url = editing
      ? `/api/spots/${editing.id}`
      : '/api/spots';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      const data = await res.json();
      if (editing) {
        setSpots((prev) =>
          prev.map((spot) => (spot.id === editing.id ? data.spot : spot))
        );
      } else {
        setSpots((prev) => [...prev, data.spot]);
      }
      setFormData({ id: '', title: '', latitude: 0, longitude: 0, description: '' });
      setEditing(null);
    }
  };

  // Handle editing a spot
  const handleEdit = (spot: Spot) => {
    setEditing(spot);
    setFormData(spot);
  };

  // Handle deleting a spot
  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/spots/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSpots((prev) => prev.filter((spot) => spot.id !== id));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{editing ? 'Edit' : 'Create'} Spot</h1>
      <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded shadow-md">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Title"
          required
          className="w-full p-2 mb-2 bg-gray-700 text-white"
        />
        <input
          type="number"
          name="latitude"
          value={formData.latitude}
          onChange={handleInputChange}
          placeholder="Latitude"
          required
          className="w-full p-2 mb-2 bg-gray-700 text-white"
        />
        <input
          type="number"
          name="longitude"
          value={formData.longitude}
          onChange={handleInputChange}
          placeholder="Longitude"
          required
          className="w-full p-2 mb-2 bg-gray-700 text-white"
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Description"
          required
          className="w-full p-2 mb-4 bg-gray-700 text-white"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {editing ? 'Update Spot' : 'Create Spot'}
        </button>
      </form>

      <h2 className="text-xl font-semibold mt-6">Spots List</h2>
      <div className="mt-4">
        {spots.map((spot) => (
          <div key={spot.id} className="flex justify-between items-center p-4 mb-4 bg-gray-800 rounded">
            <div>
              <h3 className="text-lg font-bold">{spot.title}</h3>
              <p>{spot.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(spot)}
                className="bg-yellow-500 text-white px-4 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(spot.id)}
                className="bg-red-600 text-white px-4 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
