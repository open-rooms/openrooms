const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function fetchRooms() {
  const res = await fetch(`${API_URL}/api/rooms`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch rooms');
  return res.json();
}

export async function fetchRoom(id: string) {
  const res = await fetch(`${API_URL}/api/rooms/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch room');
  return res.json();
}

export async function fetchRoomLogs(id: string) {
  const res = await fetch(`${API_URL}/api/rooms/${id}/logs`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch logs');
  return res.json();
}

export async function runRoom(id: string) {
  const res = await fetch(`${API_URL}/api/rooms/${id}/run`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to run room');
  return res.json();
}

export async function fetchWorkflows() {
  const res = await fetch(`${API_URL}/api/workflows`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch workflows');
  return res.json();
}

export async function fetchTools() {
  const res = await fetch(`${API_URL}/api/tools`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch tools');
  return res.json();
}
