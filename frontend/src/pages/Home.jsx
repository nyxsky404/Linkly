import { useState } from 'react'
import axios from 'axios'
import './Home.css'
import { CheckIcon, CopyIcon, DownloadIcon } from '../components/Icons'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function Home({ navigateTo }) {
  const [url, setUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const payload = { url }
      if (customAlias.trim()) {
        payload.customAlias = customAlias.trim()
      }

      const response = await axios.post(`${API_URL}/short`, payload)
      setResult(response.data)
      setUrl('')
      setCustomAlias('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create short URL')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <span className="hero-eyebrow">The all-in-one link platform</span>
        <h1 className="hero-title">
          Build stronger digital connections
        </h1>
        <p className="hero-subtitle">
          Shorten long links, generate QR codes, and track every click — all in one place.
        </p>
      </div>

      <div className="create-section">
        <div className="create-card">
          <h2 className="card-title">Shorten a long link</h2>
          <p className="card-subtitle">Paste a URL below and get a short, trackable link in seconds.</p>

          <form onSubmit={handleSubmit} className="create-form">
            <div className="form-group">
              <label className="form-label">Destination URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/my-long-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Custom back-half <span className="label-optional">(optional)</span>
              </label>
              <div className="alias-field">
                <span className="alias-prefix">linkly.to/</span>
                <input
                  type="text"
                  className="form-input alias-input"
                  placeholder="my-custom-link"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  pattern="[a-zA-Z0-9_-]{3,20}"
                />
              </div>
              <span className="label-hint">3–20 characters · letters, numbers, hyphens, underscores</span>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create your link'}
            </button>
          </form>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {result && (
            <div className="result-section">
              <div className="success-message">
                <span className="success-icon"><CheckIcon width={16} height={16} /></span>
                <span className="success-text">Your link is ready</span>
              </div>

              <div className="result-card">
                <div className="result-url">
                  <span className="url-label">Short link</span>
                  <a href={result.shorter_url} target="_blank" rel="noopener noreferrer" className="short-url">
                    {result.shorter_url}
                  </a>
                </div>
                <button className="btn-copy" onClick={() => copyToClipboard(result.shorter_url)}>
                  {copied ? <CheckIcon width={16} height={16} /> : <CopyIcon width={16} height={16} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="qr-section">
                <div className="qr-preview">
                  <img src={result.qr_code.png} alt="QR Code" className="qr-image" />
                </div>
                <div className="qr-meta">
                  <h3 className="qr-title">Scan or download the QR code</h3>
                  <p className="qr-sub">Perfect for print, packaging, or sharing offline.</p>
                  <div className="qr-downloads">
                    <a href={`${result.qr_code.png}&download=true`} className="btn-download" download>
                      <DownloadIcon width={15} height={15} /> PNG
                    </a>
                    <a href={`${result.qr_code.jpeg}&download=true`} className="btn-download" download>
                      <DownloadIcon width={15} height={15} /> JPEG
                    </a>
                    <a href={`${result.qr_code.svg}&download=true`} className="btn-download" download>
                      <DownloadIcon width={15} height={15} /> SVG
                    </a>
                  </div>
                </div>
              </div>

              <button className="btn-secondary" onClick={() => navigateTo('links')}>
                View all links
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
