// store.js
const LS_KEY = 'parkingState';
const CHANNEL = new BroadcastChannel('parking-sync');

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // default awal: contoh satu lokasi "filkom" dengan A1..A20 available
  const spots = {};
  for (let i = 1; i <= 20; i++) spots['A'+i] = 'available';
  const state = {
    lots: {
      filkom: { name: 'Parkiran Filkom', spots } // id lot = "filkom"
    },
    updatedAt: Date.now()
  };
  localStorage.setItem(LS_KEY, JSON.stringify(state));
  return state;
}

function saveState(state) {
  state.updatedAt = Date.now();
  localStorage.setItem(LS_KEY, JSON.stringify(state));
  // informasikan ke halaman lain
  CHANNEL.postMessage({ type: 'state:updated', updatedAt: state.updatedAt });
}

export function getState() {
  return loadState();
}

export function setSpot(lotId, spotCode, status /* 'available'|'occupied' */) {
  const state = loadState();
  if (!state.lots[lotId]) return;
  state.lots[lotId].spots[spotCode] = status;
  saveState(state);
}

export function toggleSpot(lotId, spotCode) {
  const state = loadState();
  if (!state.lots[lotId]) return;
  const cur = state.lots[lotId].spots[spotCode] || 'available';
  state.lots[lotId].spots[spotCode] = (cur === 'available') ? 'occupied' : 'available';
  saveState(state);
}

export function getAvailableCount(lotId) {
  const state = loadState();
  const spots = state.lots[lotId]?.spots || {};
  return Object.values(spots).filter(v => v === 'available').length;
}

export function subscribe(onUpdate) {
  // dipanggil ketika state berubah dari halaman lain
  CHANNEL.onmessage = (e) => {
    if (e.data?.type === 'state:updated') onUpdate?.();
  };
  // fallback kalau BroadcastChannel tidak ada (opsional):
  window.addEventListener('storage', (e) => {
    if (e.key === LS_KEY) onUpdate?.();
  });
}
