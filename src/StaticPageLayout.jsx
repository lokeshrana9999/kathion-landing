import { Outlet, Link } from 'react-router-dom'

const BRAND_LOGO_SRC = '/Web_Photo_Editor.png'

export default function StaticPageLayout() {
  return (
    <div className="static-site">
      <header className="static-header">
        <Link className="static-brand" to="/" aria-label="Kathion home">
          <img
            src={BRAND_LOGO_SRC}
            alt=""
            className="brand-logo brand-logo--nav"
            width={905}
            height={398}
            decoding="async"
          />
        </Link>
        <nav className="static-nav" aria-label="Site">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/terms">Terms</Link>
        </nav>
      </header>
      <Outlet />
    </div>
  )
}
