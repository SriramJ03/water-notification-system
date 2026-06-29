import React, { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdPeople, MdClose } from 'react-icons/md';
import { toast } from 'react-toastify';
import API from '../services/api';

const avatarBg = ['#E1F5EE','#E6F1FB','#FAEEDA','#FCE8F8','#FCEBEB','#f0eaff'];
const avatarFg = ['#0F6E56','#185FA5','#BA7517','#8B21A5','#A32D2D','#7c3aed'];
const colorFor = (id) => [avatarBg[id % 6], avatarFg[id % 6]];

const emptyForm = { house_number: '', family_name: '', phone: '', members_count: 1, address: '' };

function Modal({ title, form, setForm, onSave, onClose, loading }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}><MdClose /></button>
        </div>
        <div className="grid-2" style={{ gap: '0 1rem' }}>
          <div className="form-group">
            <label className="form-label">House number *</label>
            <input className="form-input" value={form.house_number} onChange={e => setForm({ ...form, house_number: e.target.value })} placeholder="12" />
          </div>
          <div className="form-group">
            <label className="form-label">Members</label>
            <input type="number" className="form-input" value={form.members_count} onChange={e => setForm({ ...form, members_count: e.target.value })} min="1" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Family name</label>
          <input className="form-input" value={form.family_name} onChange={e => setForm({ ...form, family_name: e.target.value })} placeholder="Kumar Family" />
        </div>
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="98765 43210" />
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <input className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="House 12, Street 3" />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button className="btn btn-primary" onClick={onSave} disabled={loading} style={{ flex: 1 }}>
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Neighbors() {
  const [neighbors, setNeighbors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null); // 'add' | { edit: neighbor }
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchNeighbors(); }, []);

  const fetchNeighbors = async (s = search) => {
    setLoading(true);
    try {
      const { data } = await API.get('/neighbors', { params: s ? { search: s } : {} });
      setNeighbors(data.neighbors);
    } catch {
      toast.error('Failed to load neighbors.');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (n) => { setForm({ ...n }); setModal({ edit: n }); };
  const closeModal = () => setModal(null);

  const handleSave = async () => {
    if (!form.house_number) return toast.error('House number is required.');
    setSaving(true);
    try {
      if (modal === 'add') {
        await API.post('/neighbors', form);
        toast.success('Neighbor added!');
      } else {
        await API.put(`/neighbors/${modal.edit.id}`, form);
        toast.success('Neighbor updated!');
      }
      closeModal();
      fetchNeighbors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} from your neighbors?`)) return;
    try {
      await API.delete(`/neighbors/${id}`);
      toast.success('Neighbor removed.');
      setNeighbors(prev => prev.filter(n => n.id !== id));
    } catch {
      toast.error('Failed to remove.');
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchNeighbors(e.target.value);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">Neighbors</div>
        <div className="page-subtitle">Manage your neighborhood directory</div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: '1rem' }}>
        <div className="search-box" style={{ flex: 1, marginBottom: 0 }}>
          <MdSearch className="search-icon" />
          <input placeholder="Search by name or house number" value={search} onChange={handleSearch} />
        </div>
        <button className="btn btn-primary" onClick={openAdd}><MdAdd /> Add neighbor</button>
      </div>

      <div className="section-header">
        <div className="section-title">My neighbors · {neighbors.length}</div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : neighbors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <MdPeople style={{ fontSize: 40, opacity: 0.3, marginBottom: 8 }} />
          <div>No neighbors added yet.</div>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={openAdd}><MdAdd /> Add first neighbor</button>
        </div>
      ) : neighbors.map((n, i) => {
        const [bg, fg] = colorFor(i);
        const initials = (n.family_name || n.house_number || '?').slice(0, 2).toUpperCase();
        return (
          <div key={n.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '0.75rem 1rem', background: '#fff',
            border: '1px solid var(--border)', borderRadius: 10,
            marginBottom: 8, transition: 'background 0.1s'
          }}>
            <div className="avatar avatar-md" style={{ background: bg, color: fg }}>{initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                {n.family_name || `House ${n.house_number}`}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                House {n.house_number}
                {n.members_count ? ` · ${n.members_count} members` : ''}
                {n.phone ? ` · ${n.phone}` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-icon-sm" onClick={() => openEdit(n)} title="Edit"><MdEdit /></button>
              <button
                className="btn-icon-sm"
                onClick={() => handleDelete(n.id, n.family_name || `House ${n.house_number}`)}
                title="Remove"
                style={{ color: 'var(--red-400)' }}
              >
                <MdDelete />
              </button>
            </div>
          </div>
        );
      })}

      {modal && (
        <Modal
          title={modal === 'add' ? 'Add Neighbor' : 'Edit Neighbor'}
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={closeModal}
          loading={saving}
        />
      )}
    </div>
  );
}
