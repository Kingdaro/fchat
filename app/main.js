const electron = require('electron')
const {app} = electron
const {BrowserWindow} = electron
const path = require('path')

let win

function createWindow () {
  win = new BrowserWindow({ title: 'F-Chat Next' })

  const index = path.resolve(__dirname, '../index.html')

  if (process.argv.includes('--dev')) {
    win.loadURL('http://localhost:8080')
    win.webContents.openDevTools()
  } else {
    win.loadURL(`file://${index}`)
  }

  win.on('closed', () => {
    win = null
  })

  win.maximize()
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})
