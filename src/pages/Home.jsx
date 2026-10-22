import Hero from '../components/Hero.jsx'
import UseCases from '../components/UseCases.jsx'
import Integrations from '../components/Integrations.jsx'
import ControlCenter from '../components/ControlCenter.jsx'
import AgentPlatform from '../components/AgentPlatform.jsx'
import Security from '../components/Security.jsx'
import ClosingCTA from '../components/ClosingCTA.jsx'

export default function Home() {
  return (
    <main>
      <Hero />
      <UseCases />
      <Integrations />
      <ControlCenter />
      <AgentPlatform />
      <Security />
      <ClosingCTA />
    </main>
  )
}
