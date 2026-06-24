import { useState } from 'react'
import './App.css'
import Home from './pages/Home'
import Links from './pages/Links'
import LinkDetails from './pages/LinkDetails'
import { LinkIcon } from './components/Icons'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedLink, setSelectedLink] = useState(null)

  const navigateTo = (page, link = null) => {
    setCurrentPage(page)
    if (link) setSelectedLink(link)
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <button className="nav-brand" onClick={() => navigateTo('home')}>
            <span className="logo">
              <LinkIcon width={20} height={20} />
            </span>
            <span className="brand-name">Linkly</span>
          </button>
          <div className="nav-links">
            <button
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => navigateTo('home')}
            >
              Home
            </button>
            <button
              className={`nav-link ${currentPage === 'links' || currentPage === 'details' ? 'active' : ''}`}
              onClick={() => navigateTo('links')}
            >
              My Links
            </button>
            <button className="nav-cta" onClick={() => navigateTo('home')}>
              Create link
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {currentPage === 'home' && <Home navigateTo={navigateTo} />}
        {currentPage === 'links' && <Links navigateTo={navigateTo} />}
        {currentPage === 'details' && <LinkDetails link={selectedLink} navigateTo={navigateTo} />}
      </main>
    </div>
  )
}

export default App
