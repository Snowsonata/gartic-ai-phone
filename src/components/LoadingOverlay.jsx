const STATUS_COPY = {
  CREATING: '传递中…',
  PENDING: '排队中…',
  RUNNING: '绘制中…',
  SUCCEEDED: '完成!',
}

export default function LoadingOverlay({ status, label = '生成图片' }) {
  return (
    <div className="loading" role="alert" aria-busy="true">
      <div className="loading-inner">
        <div className="orbit"><i /><i /></div>
        <h2 className="loading-title">{label}</h2>
        <div className="loading-status">{STATUS_COPY[status] || '生成中…'}</div>
        {/* Indeterminate progress — blue gradient only, never green */}
        <div className="loading-track"><i /></div>
      </div>
    </div>
  )
}
