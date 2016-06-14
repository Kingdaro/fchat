import store from './vuex/store'
import {getAccount, getApiTicket, getCharacterName} from './vuex/getters'
import {inspect} from 'util'

const urls = {
  mainInsecure: 'ws://chat.f-list.net:9722',
  main: 'wss://chat.f-list.net:9799',
  testInsecure: 'ws://chat.f-list.net:8722',
  test: 'ws://chat.f-list.net:8799'
}

export default class SocketHandler {
  connect (urlID) {
    return new Promise((resolve, reject) => {
      /* eslint no-undef: 0 */
      this.ws = new WebSocket(urls[urlID])

      this.ws.onopen = () => {
        this.sendIdentifyRequest()
      }

      this.ws.onclose = () => {
        const err = 'Lost connection to server. :('
        store.dispatch('SOCKET_ERROR', err)
        reject(err)
      }

      this.ws.onerror = err => {
        store.dispatch('SOCKET_ERROR', err)
        reject(err)
      }

      this.ws.onmessage = ({data}) => {
        const {command, params} = this.parseServerCommand(data)
        this.handleChatCommand(command, params)

        if (command === 'IDN') {
          store.dispatch('CHAT_IDENTIFY_SUCCESS', this)
          resolve()
        }
      }
    })
  }

  sendIdentifyRequest () {
    const {state} = store

    const params = {
      method: 'ticket',
      account: getAccount(state),
      ticket: getApiTicket(state),
      character: getCharacterName(state),
      cname: 'fchat-next',
      cversion: '0.1.0'
    }

    this.ws.send(`IDN ${JSON.stringify(params)}`)
  }

  parseServerCommand (payload) {
    const command = payload.substring(0, 3)
    const params = payload.length > 3 ? JSON.parse(payload.substring(4)) : {}
    return {command, params}
  }

  handleChatCommand (command, params) {
    switch (command) {
      // identify with server
      case 'IDN':
        this.fetchChannelList()
        break

      /* ping~! */
      case 'PIN':
        /* pong~! */
        this.ws.send('PIN')
        break

      // receiving server variables
      case 'VAR':
        store.dispatch('SET_SERVER_VARIABLE', params.variable, params.value)
        break

      // hello :)
      case 'HLO':
        console.info(params.message)
        break

      // receive # of characters online
      case 'CON':
        console.info(`There are ${params.count} characters online.`)
        break

      // receiving list of friends
      // we can ignore this, since we already got that from the login data
      case 'FRL': break

      // receiving ignore list action
      case 'IGN':
        switch (params.action) {
          case 'init':
            store.dispatch('SET_IGNORE_LIST', params.characters)
            break

          default:
            console.warn(`Unknown ignore list action ${params.action}`)
        }
        break

      // receiving list of admins
      case 'ADL':
        store.dispatch('SET_ADMIN_LIST', params.ops)
        break

      // receiving all characters online
      // comes in multiple batches
      case 'LIS':
        store.dispatch('HASH_CHARACTERS', params.characters)
        break

      // character came online
      case 'NLN':
        store.dispatch('ADD_CHARACTER', params.identity, {
          status: params.status,
          gender: params.gender,
          statusMessage: ''
        })
        break

      // character went offline
      case 'FLN':
        store.dispatch('REMOVE_CHARACTER', params.character)
        break

      // character changed status
      case 'STA':
        store.dispatch('SET_CHARACTER_STATUS', params.character, params.status, params.statusMessage)
        break

      // received list of public channels
      case 'CHA':
        store.dispatch('SET_PUBLIC_CHANNEL_LIST', params.channels)
        break

      // received list of private channels
      case 'ORS':
        store.dispatch('SET_PRIVATE_CHANNEL_LIST', params.channels)
        break

      default:
        console.warn(`Unknown command ${command} with params:\n`, inspect(params, { depth: null }))
    }
  }

  fetchChannelList () {
    this.ws.send('CHA')
    this.ws.send('ORS')
  }
}
