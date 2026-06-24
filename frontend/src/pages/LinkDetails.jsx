import { useState, useEffect } from 'react'
import axios from 'axios'
import './LinkDetails.css'
import { ArrowLeftIcon, CopyIcon, CheckIcon, DownloadIcon } from '../components/Icons'
import { ClicksOverTime, RankedBars, DonutChart } from '../components/Charts'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const toSortedArray = (obj = {}, limit) => {
  const arr = Object.entries(obj)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
  return limit ? arr.slice(0, limit) : arr
}

// Label for a UTC day. Formatting in UTC keeps it aligned with the key below.
const formatDay = (date) =>
  date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })

// UTC day key (YYYY-MM-DD) — matches the backend, which groups clicks by
// `clicked_at.toISOString()`. Building keys from local time would shift days
// in non-UTC zones and miss every bucket.
const utcKey = (date) => date.toISOString().split('T')[0]
const DAY_MS = 24 * 60 * 60 * 1000
const MIN_DAYS = 14 // always show at least this many days so a lone bar isn't isolated
const MAX_DAYS = 30 // cap so long-lived links stay readable

// Build a continuous daily series ending at today, with empty days filled in so
// the most recent activity sits at the right edge against a run of past dates
// rather than floating alone. The window always spans at least MIN_DAYS (and
// extends back to the link's creation date, up to MAX_DAYS).
const buildDailySeries = (clicksByDay = {}, createdAt) => {
  const utcMidnight = (d) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())

  const end = utcMidnight(new Date())
  const minStart = end - (MIN_DAYS - 1) * DAY_MS
  const maxStart = end - (MAX_DAYS - 1) * DAY_MS

  let start = utcMidnight(new Date(createdAt))
  if (start > minStart) start = minStart // pad short-lived links back to the minimum window
  if (start < maxStart) start = maxStart // cap older links to the maximum window

  const series = []
  for (let ms = start; ms <= end; ms += DAY_MS) {
    const day = new Date(ms)
    series.push({ date: formatDay(day), clicks: clicksByDay[utcKey(day)] || 0 })
  }
  return series
}

function LinkDetails({ link, navigateTo }) {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (link) {
      fetchAnalytics()
    }
  }, [link])

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API_URL}/analytics/${link.url_id}`)
      setAnalytics(response.data)
    } catch (err) {
      console.error('Failed to fetch analytics', err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!link) {
    return <div>No link selected</div>
  }

  if (loading) {
    return <div className="loading">Loading analytics…</div>
  }

  const a = analytics.analytics
  const timeSeries = buildDailySeries(a.clicksByDay, analytics.created_at)
  const countries = toSortedArray(a.clicksByCountry, 6)
  const devices = toSortedArray(a.clicksByDevice)
  const browsers = toSortedArray(a.clicksByBrowser)
  const referrers = toSortedArray(a.topReferrers, 5)
  const topCountry = countries[0]?.name || '—'

  return (
    <div className="details-page">
      <button className="btn-back" onClick={() => navigateTo('links')}>
        <ArrowLeftIcon width={16} height={16} /> Back to links
      </button>

      <div className="details-header">
        <div className="details-head-info">
          <span className="details-eyebrow">Link analytics</span>
          <a
            href={analytics.shorter_url}
            target="_blank"
            rel="noopener noreferrer"
            className="details-link"
          >
            {analytics.shorter_url}
          </a>
          <a
            href={analytics.org_url}
            target="_blank"
            rel="noopener noreferrer"
            className="details-original"
          >
            {analytics.org_url}
          </a>
        </div>
        <button
          className="btn-copy-lg"
          onClick={() => copyToClipboard(analytics.shorter_url)}
        >
          {copied ? <CheckIcon width={16} height={16} /> : <CopyIcon width={16} height={16} />}
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>

      <div className="stats-overview">
        <div className="stat-box">
          <span className="stat-box-label">Total Clicks</span>
          <span className="stat-box-value">{a.totalClicks}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box-label">Countries</span>
          <span className="stat-box-value">{Object.keys(a.clicksByCountry).length}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box-label">Top Location</span>
          <span className="stat-box-value stat-box-value-sm">{topCountry}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box-label">Created</span>
          <span className="stat-box-value stat-box-value-sm">
            {new Date(analytics.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      <div className="chart-card chart-card-wide">
        <div className="chart-head">
          <h3 className="chart-title">Engagements over time</h3>
          <span className="chart-sub">Clicks per day</span>
        </div>
        {timeSeries.length > 0 ? (
          <ClicksOverTime data={timeSeries} />
        ) : (
          <p className="no-data">No clicks recorded yet</p>
        )}
      </div>

      <div className="analytics-grid">
        <div className="chart-card">
          <div className="chart-head">
            <h3 className="chart-title">Locations</h3>
            <span className="chart-sub">Top countries</span>
          </div>
          {countries.length > 0 ? (
            <RankedBars data={countries} />
          ) : (
            <p className="no-data">No location data yet</p>
          )}
        </div>

        <div className="chart-card">
          <div className="chart-head">
            <h3 className="chart-title">Devices</h3>
            <span className="chart-sub">By device & OS</span>
          </div>
          {devices.length > 0 ? (
            <DonutChart data={devices} />
          ) : (
            <p className="no-data">No device data yet</p>
          )}
        </div>

        <div className="chart-card">
          <div className="chart-head">
            <h3 className="chart-title">Browsers</h3>
            <span className="chart-sub">Where clicks come from</span>
          </div>
          {browsers.length > 0 ? (
            <DonutChart data={browsers} />
          ) : (
            <p className="no-data">No browser data yet</p>
          )}
        </div>

        <div className="chart-card">
          <div className="chart-head">
            <h3 className="chart-title">Top Referrers</h3>
            <span className="chart-sub">Traffic sources</span>
          </div>
          {referrers.length > 0 ? (
            <RankedBars
              data={referrers.map((r) => ({
                ...r,
                name: r.name.length > 18 ? `${r.name.substring(0, 18)}…` : r.name,
              }))}
            />
          ) : (
            <p className="no-data">No referrer data yet</p>
          )}
        </div>
      </div>

      <div className="qr-section-details">
        <h2 className="section-title">QR Code</h2>
        <div className="qr-container">
          <div className="qr-preview-large">
            <img
              src={`${API_URL}/qr/${link.url_id}?format=png`}
              alt="QR Code"
              className="qr-image-large"
            />
          </div>
          <div className="qr-actions">
            <p className="qr-description">
              Download your QR code in multiple formats for offline sharing
            </p>
            <div className="qr-buttons">
              <a
                href={`${API_URL}/qr/${link.url_id}?format=png&download=true`}
                className="btn-qr"
                download
              >
                <DownloadIcon width={16} height={16} /> Download PNG
              </a>
              <a
                href={`${API_URL}/qr/${link.url_id}?format=jpeg&download=true`}
                className="btn-qr"
                download
              >
                <DownloadIcon width={16} height={16} /> Download JPEG
              </a>
              <a
                href={`${API_URL}/qr/${link.url_id}?format=svg&download=true`}
                className="btn-qr"
                download
              >
                <DownloadIcon width={16} height={16} /> Download SVG
              </a>
            </div>
          </div>
        </div>
      </div>

      {a.recentClicks.length > 0 && (
        <div className="recent-clicks">
          <h2 className="section-title">Recent Clicks</h2>
          <div className="clicks-table">
            {a.recentClicks.map((click, index) => (
              <div key={index} className="click-row">
                <div className="click-info">
                  <span className="click-country">{click.country}</span>
                  <span className="click-detail">
                    {click.browser} on {click.os} • {click.device_type}
                  </span>
                </div>
                <span className="click-time">
                  {new Date(click.clicked_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default LinkDetails
