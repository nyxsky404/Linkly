import { useState, useEffect } from 'react'
import axios from 'axios'
import './Links.css'
import { LinkIcon, CopyIcon, ChartIcon, TrashIcon, PlusIcon, SearchIcon } from '../components/Icons'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function Links({ navigateTo }) {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      const response = await axios.get(`${API_URL}/get-db`)
      setLinks(response.data)
    } catch (err) {
      setError('Failed to fetch links')
    } finally {
      setLoading(false)
    }
  }

  const deleteLink = async (urlId) => {
    if (!confirm('Are you sure you want to delete this link?')) return

    try {
      await axios.delete(`${API_URL}/delete/${urlId}`)
      setLinks(links.filter(link => link.url_id !== urlId))
    } catch (err) {
      alert('Failed to delete link')
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const filteredLinks = links.filter(link =>
    link.shorter_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.org_url.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="loading">Loading links…</div>
  }

  return (
    <div className="links-page">
      <div className="links-header">
        <div>
          <h1 className="page-title">My Links</h1>
          <p className="page-subtitle">{links.length} {links.length === 1 ? 'link' : 'links'} created</p>
        </div>
        <button className="btn-create" onClick={() => navigateTo('home')}>
          <PlusIcon width={17} height={17} /> Create new
        </button>
      </div>

      <div className="search-bar">
        <SearchIcon className="search-icon" width={18} height={18} />
        <input
          type="text"
          className="search-input"
          placeholder="Search by short link or destination…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {filteredLinks.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon"><LinkIcon width={32} height={32} /></span>
          <h2>No links yet</h2>
          <p>Create your first short link to get started</p>
          <button className="btn-create" onClick={() => navigateTo('home')}>
            <PlusIcon width={17} height={17} /> Create link
          </button>
        </div>
      ) : (
        <div className="links-grid">
          {filteredLinks.map((link) => (
            <div key={link.url_id} className="link-card">
              <div className="link-header">
                <div className="link-info">
                  <a
                    href={link.shorter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-short"
                  >
                    {link.shorter_url}
                  </a>
                  <a
                    href={link.org_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-original"
                  >
                    {link.org_url.substring(0, 50)}
                    {link.org_url.length > 50 ? '...' : ''}
                  </a>
                </div>
              </div>

              <div className="link-stats">
                <div className="stat">
                  <span className="stat-label">Clicks</span>
                  <span className="stat-value">{link._count?.clicks || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Created</span>
                  <span className="stat-value">
                    {new Date(link.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="link-actions">
                <button
                  className="btn-action"
                  onClick={() => copyToClipboard(link.shorter_url)}
                  title="Copy link"
                >
                  <CopyIcon width={16} height={16} /> Copy
                </button>
                <button
                  className="btn-action"
                  onClick={() => navigateTo('details', link)}
                  title="View details"
                >
                  <ChartIcon width={16} height={16} /> Analytics
                </button>
                <button
                  className="btn-action btn-danger"
                  onClick={() => deleteLink(link.url_id)}
                  title="Delete"
                >
                  <TrashIcon width={16} height={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Links
