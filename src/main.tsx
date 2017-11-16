import './index.scss'
import './ui/styles/globalStyles'

import { useStrict } from 'mobx'
import { Provider as StoreProvider } from 'mobx-react'
import DevTools from 'mobx-react-devtools'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { ThemeProvider } from 'styled-components'

import { init } from './app/actions'
import { App } from './app/components/App'
import { stores } from './stores'
import { theme } from './ui/theme'

const devmode = process.env.NODE_ENV !== 'production'

function Root() {
  return (
    <div>
      <StoreProvider {...stores}>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </StoreProvider>
      {devmode && <DevTools position={{ right: 0, bottom: 0 }} />}
    </div>
  )
}

function render() {
  ReactDOM.render(<Root />, document.getElementById('root'))
}

function main() {
  useStrict(true)
  render()
  init().catch(console.error)

  if (devmode) {
    if (module.hot) {
      module.hot.accept('./app/components/App', render)
    }

    ;(window as any).stores = stores
  }
}

main()
