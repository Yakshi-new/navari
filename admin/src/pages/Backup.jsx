import React, { useEffect, useState, useCallback } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

// ── Helpers ──────────────────────────────────────────────────────────
const formatDate = (isoStr) => {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

const StatusBadge = ({ success, errors }) => {
  if (errors && errors.length > 0) {
    return <span className="backup-badge backup-badge--warn">⚠️ Partial</span>;
  }
  return success !== false
    ? <span className="backup-badge backup-badge--ok">✅ Success</span>
    : <span className="backup-badge backup-badge--err">❌ Failed</span>;
};

// ── Main Component ────────────────────────────────────────────────────
const Backup = () => {
  const [status, setStatus] = useState(null);
  const [backups, setBackups] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [running, setRunning] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await API.get('/admin/backup/status');
      if (data.success) setStatus(data.data);
    } catch {
      toast.error('Failed to load backup status');
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  const fetchList = useCallback(async () => {
    try {
      const { data } = await API.get('/admin/backup/list');
      if (data.success) setBackups(data.data);
    } catch {
      toast.error('Failed to load backup list');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchList();
  }, [fetchStatus, fetchList]);

  const handleRunBackup = async () => {
    if (running) return;
    setRunning(true);
    const loadId = toast.loading('🔄 Running backup, please wait...');
    try {
      const { data } = await API.post('/admin/backup/run');
      toast.dismiss(loadId);
      if (data.success) {
        toast.success(`✅ Backup done! ${data.data.size} — ${data.data.collections.length} collections`);
      } else {
        toast.error(`⚠️ Backup partial: ${data.data.errors.join(', ')}`);
      }
      // Refresh list and status
      await Promise.all([fetchStatus(), fetchList()]);
    } catch (err) {
      toast.dismiss(loadId);
      toast.error(err.message || 'Backup failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="backup-page">
      {/* ── Page Header ── */}
      <div className="backup-header">
        <div>
          <h2 className="backup-title">
            <i className="bi bi-database-fill-gear" style={{ marginRight: 10 }}></i>
            Data Backup
          </h2>
          <p className="backup-subtitle">
            Automated daily snapshots of all database collections. Stored in{' '}
            <code>backup/navari/data/</code>. Maximum 15 backups retained.
          </p>
        </div>
        <button
          className="btn-backup-run"
          onClick={handleRunBackup}
          disabled={running}
          id="backup-run-btn"
        >
          {running ? (
            <>
              <span className="backup-spinner"></span>
              Running...
            </>
          ) : (
            <>
              <i className="bi bi-play-circle-fill"></i>
              Run Backup Now
            </>
          )}
        </button>
      </div>

      {/* ── Scheduler Status Cards ── */}
      <div className="backup-stats-grid">
        <div className="backup-stat-card">
          <div className="backup-stat-icon backup-stat-icon--blue">
            <i className="bi bi-clock-fill"></i>
          </div>
          <div>
            <div className="backup-stat-label">Schedule</div>
            <div className="backup-stat-value">
              {loadingStatus ? '—' : status?.schedule || 'Daily 00:10 AM IST'}
            </div>
          </div>
        </div>

        <div className="backup-stat-card">
          <div className="backup-stat-icon backup-stat-icon--green">
            <i className="bi bi-arrow-clockwise"></i>
          </div>
          <div>
            <div className="backup-stat-label">Next Auto Backup</div>
            <div className="backup-stat-value">
              {loadingStatus ? '—' : formatDate(status?.nextRun)}
            </div>
          </div>
        </div>

        <div className="backup-stat-card">
          <div className="backup-stat-icon backup-stat-icon--purple">
            <i className="bi bi-archive-fill"></i>
          </div>
          <div>
            <div className="backup-stat-label">Stored Backups</div>
            <div className="backup-stat-value">
              {loadingStatus ? '—' : `${status?.totalBackups ?? '—'} / ${status?.maxBackups ?? 15}`}
            </div>
          </div>
        </div>

        <div className="backup-stat-card">
          <div className="backup-stat-icon backup-stat-icon--amber">
            <i className="bi bi-box-seam-fill"></i>
          </div>
          <div>
            <div className="backup-stat-label">Latest Backup</div>
            <div className="backup-stat-value">
              {loadingStatus ? '—' : status?.latestBackup
                ? formatDate(status.latestBackup.generatedAt)
                : 'None yet'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Backup History Table ── */}
      <div className="backup-table-card">
        <div className="backup-table-header">
          <h3 className="backup-table-title">
            <i className="bi bi-list-ul" style={{ marginRight: 8 }}></i>
            Backup History
          </h3>
          <button
            className="btn-backup-refresh"
            onClick={() => { fetchStatus(); fetchList(); }}
            title="Refresh"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>

        {loadingList ? (
          <div className="backup-loading">
            <div className="backup-spinner-lg"></div>
            <span>Loading backup history...</span>
          </div>
        ) : backups.length === 0 ? (
          <div className="backup-empty">
            <i className="bi bi-inbox" style={{ fontSize: 40, opacity: 0.3 }}></i>
            <p>No backups found. Run a backup to get started.</p>
          </div>
        ) : (
          <div className="backup-table-wrap">
            <table className="backup-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Folder / Timestamp</th>
                  <th>Type</th>
                  <th>Collections</th>
                  <th>Size</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b, i) => (
                  <tr key={b.folder}>
                    <td className="backup-td-num">{i + 1}</td>
                    <td>
                      <code className="backup-folder">{b.folder}</code>
                      {b.generatedAt && (
                        <div className="backup-date">{formatDate(b.generatedAt)}</div>
                      )}
                    </td>
                    <td>
                      <span className={`backup-type-badge ${b.manual ? 'backup-type--manual' : 'backup-type--auto'}`}>
                        {b.manual ? '🛠 Manual' : '⏰ Auto'}
                      </span>
                    </td>
                    <td>
                      <span className="backup-collections">
                        {b.collections.length > 0
                          ? b.collections.join(', ')
                          : <em style={{ opacity: 0.5 }}>—</em>}
                      </span>
                    </td>
                    <td className="backup-size">{b.size}</td>
                    <td>
                      <StatusBadge success={b.errors.length === 0} errors={b.errors} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="backup-footer-note">
          <i className="bi bi-info-circle" style={{ marginRight: 6 }}></i>
          Backups are stored at <code>backup/navari/data/</code> on the server.
          Only the latest 15 backups are kept. Older ones are deleted automatically.
        </div>
      </div>
    </div>
  );
};

export default Backup;
