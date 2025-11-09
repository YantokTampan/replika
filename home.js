// home.js
import { getState, getAvailableCount, subscribe } from '../store.js'; // sesuaikan path

function render() {
  const countEl = document.getElementById('count-filkom');
  if (countEl) countEl.textContent = getAvailableCount('filkom');
}

document.addEventListener('DOMContentLoaded', () => {
  // inisialisasi (buat default kalau belum ada)
  getState();
  render();
  // dengarkan update dari halaman lain
  subscribe(render);
});
