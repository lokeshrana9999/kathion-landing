import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home.jsx'
import About from './pages/About.jsx'
import Terms from './pages/Terms.jsx'
import StaticPageLayout from './StaticPageLayout.jsx'
import './styles/home-landing.css'
import './styles/static-pages.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<StaticPageLayout />}>
          <Route path="about" element={<About />} />
          <Route path="terms" element={<Terms />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
