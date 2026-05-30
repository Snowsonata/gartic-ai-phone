const STATUS_COPY = {
  CREATING: 'Sending your idea to the studio…',
  PENDING: 'In the queue…',
  RUNNING: 'Painting pixels…',
  SUCCEEDED: 'Done!',
}

export default function LoadingOverlay({ status, label = 'Generating image' }) {
  return (
    <div className="loading" role="alert" aria-busy="true">
      <div className="loading-inner">
        <div className="orbit"><i /><i /></div>
        <h2 className="loading-title">{label}</h2>
        <div className="loading-status">{STATUS_COPY[status] || 'Working…'}</div>
        {/* Indeterminate progress — blue gradient only, never green */}
        <div className="loading-track"><i /></div>
      </div>
    </div>
  )
}
