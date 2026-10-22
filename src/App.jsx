import Home from './pages/Home.jsx'
import LegalPage from './pages/LegalPage.jsx'
import Footer from './components/Footer.jsx'
import DemoDialog from './components/DemoDialog.jsx'
import CookieBanner from './components/CookieBanner.jsx'
import { privacy, terms } from './content/legal.js'
import { PRIVACY_PATH, TERMS_PATH, currentPath } from './lib/routes.js'

const PAGES = {
  [PRIVACY_PATH]: () => <LegalPage doc={privacy} />,
  [TERMS_PATH]: () => <LegalPage doc={terms} />,
}

export default function App() {
  const Page = PAGES[currentPath()] ?? Home
  return (
    <>
      <Page />
      <Footer />
      <DemoDialog />
      <CookieBanner />
    </>
  )
}
