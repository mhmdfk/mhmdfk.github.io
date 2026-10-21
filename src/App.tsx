import { LazyMotion, domAnimation } from 'motion/react'
import { CustomCursor } from './components/CustomCursor'
import { useEffect } from 'react'
import { initSmoothScroll } from './lib/smoothScroll'
import { SceneLoader } from './scene/SceneLoader'
import { Nav } from './components/Nav'
import { ui } from './content/content'
import { Hero } from './sections/Hero'
import { Experience } from './sections/Experience'
import { Work } from './sections/Work'
import { About } from './sections/About'
import { Skills } from './sections/Skills'
import { Contact } from './sections/Contact'
import { Footer } from './sections/Footer'
import { RoomView } from './components/RoomView'

export default function App() {
  useEffect(initSmoothScroll, [])

  return (
    <LazyMotion features={domAnimation} strict>
      <CustomCursor />
      <SceneLoader />
      <RoomView />
      <div id="site-content">
        <a className="skip-link" href="#main">
          {ui.skip}
        </a>
        <Nav />
        <main id="main" tabIndex={-1} className="container">
          <Hero />
          <Experience />
          <Work />
          <About />
          <Skills />
          <Contact />
        </main>
        <Footer />
      </div>
    </LazyMotion>
  )
}
