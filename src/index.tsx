import 'normalize.css/normalize.css'
import './styles.css'

import { useStrict } from 'mobx'
import DevTools from 'mobx-react-devtools'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
// import App from './components/App'

useStrict(true)

function render() {
  const Root = require('./components/App').default
  ReactDOM.render(
    <div>
      <Root />
      <DevTools />
    </div>,
    document.getElementById('root')
  )
}

render()

declare var module: any
if (module.hot) {
  module.hot.accept('./components/App', render)
}
