import { Footer } from './components/footer'
import Form from './components/form-google-microsoft'

import { Guests } from './components/guests'
import { Header } from './components/header'
import { Intro } from './components/intro'
import { Programing } from './components/programing'
// import { Toaster } from './components/ui/toaster'

export function App() {
  return (
    <>
      <Header />
      <Intro />
      <Guests />
      <Programing />
      <Form />
      <Footer />
    </>
  )
}
