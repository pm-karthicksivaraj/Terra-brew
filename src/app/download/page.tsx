export default function DownloadPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>TerraBrew Source Code</h1>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>Download the latest source code archive</p>
        <a
          href="/terra-brew-source.tar.gz"
          download
          style={{
            display: 'inline-block',
            padding: '12px 32px',
            backgroundColor: '#6D2932',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '1.1rem',
            fontWeight: 600,
          }}
        >
          ⬇ Download terra-brew-source.tar.gz (4.0 MB)
        </a>
      </div>
    </div>
  );
}
