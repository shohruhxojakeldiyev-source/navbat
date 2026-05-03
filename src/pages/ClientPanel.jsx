import { useState, useEffect } from 'react';
import '../styles/ClientPanel.css'

const ClientPanel = () => {
  const [currentQueue, setCurrentQueue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftValue, setShiftValue] = useState(1);

  // ==================== API FUNCTIONS ====================

  // Foydalanuvchining joriy navbatini olish
  const fetchCurrentQueue = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/client/queue'); // o'zingizning backend URL
      setCurrentQueue(res.data.queueNumber);
      setShiftValue(res.data.queueNumber || 1);
    } catch (err) {
      console.error(err);
      setError("Navbat ma'lumotini olishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  // Navbat olish
  const takeQueue = async () => {
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/client/take-queue');
      setCurrentQueue(res.data.queueNumber);
      setShiftValue(res.data.queueNumber);
      alert(`🎉 Sizga ${res.data.queueNumber}-navbat berildi!`);
    } catch (err) {
      alert("Xatolik yuz berdi: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Navbatni bekor qilish
  const confirmCancel = async () => {
    try {
      setLoading(true);
      await axios.delete('http://localhost:5000/api/client/queue');
      setCurrentQueue(0);
      alert("✅ Navbatingiz bekor qilindi.");
    } catch (err) {
      alert("Bekor qilishda xatolik");
    } finally {
      setLoading(false);
      setShowCancelModal(false);
    }
  };

  // Navbatni surish
  const confirmShift = async () => {
    try {
      setLoading(true);
      await axios.put('http://localhost:5000/api/client/shift', { newPosition: shiftValue });
      setCurrentQueue(shiftValue);
      alert(`✅ Navbat ${shiftValue}-ga surildi.`);
    } catch (err) {
      alert("Surishda xatolik yuz berdi");
    } finally {
      setLoading(false);
      setShowShiftModal(false);
    }
  };

  // Komponent yuklanganda bir marta chaqiramiz
  useEffect(() => {
    fetchCurrentQueue();
  }, []);

  if (loading && !currentQueue) return <div className="loading">Yuklanmoqda...</div>;

  return (
    <div className="client-container">
      <div className="main-card">

        <div className="header">
          <h1>Jamshid Klinikasi</h1>
          <p>Client Panel</p>
        </div>

        <div className="content">
          <p className="label">Sizning navbatingiz</p>
          <div className="queue-number">
            {currentQueue !== null ? currentQueue : "?"}
          </div>

          <div className="action-buttons">
            <button className="btn btn-cancel" onClick={() => setShowCancelModal(true)} disabled={loading || currentQueue === 0}>
              ❌ Bekor qilish
            </button>
            <button className="btn btn-shift" onClick={() => setShowShiftModal(true)} disabled={loading || currentQueue === 0}>
              ↔️ Navbatni surish
            </button>
            <button className="btn btn-take" onClick={takeQueue} disabled={loading}>
              ➕ Navbat olish
            </button>
          </div>
        </div>
      </div>

      {/* Modallar (oldingi kabi) */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Navbatni bekor qilmoqchimisiz?</h3>
            <p>Sizning {currentQueue}-navbatingiz bekor bo‘ladi.</p>
            <div className="modal-actions">
              <button className="btn-modal" onClick={() => setShowCancelModal(false)}>Yo‘q</button>
              <button className="btn-modal danger" onClick={confirmCancel} disabled={loading}>
                {loading ? "Yuklanmoqda..." : "Ha, bekor qilish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showShiftModal && (
        <div className="modal-overlay" onClick={() => setShowShiftModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Navbatni surish</h3>
            <div className="shift-number">{shiftValue}</div>

            <div className="shift-buttons">
              <button onClick={() => setShiftValue(v => Math.max(1, v-1))}>-</button>
              <button onClick={() => setShiftValue(v => v+1)}>+</button>
            </div>

            <div className="modal-actions">
              <button className="btn-modal" onClick={() => setShowShiftModal(false)}>Bekor</button>
              <button className="btn-modal success" onClick={confirmShift} disabled={loading}>
                {loading ? "Yuklanmoqda..." : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPanel;