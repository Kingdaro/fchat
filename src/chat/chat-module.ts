import Vue from 'vue'
import Vuex from 'vuex'
import forage from 'localforage'
import fromPairs from 'lodash/fromPairs'
import { Dictionary } from '@/common/util-types'
import { Channel, ChannelInfo, Character, Message, PrivateChat } from '@/chat/models'
import { RootState } from '@/store'

let socket: WebSocket | void

export type ChatState = {
  identity: string
  friends: Dictionary<boolean>
  ignored: Dictionary<boolean>
  admins: Dictionary<boolean>
  characters: Dictionary<Character>
  channelList: ChannelInfo[]
  joinedChannels: Dictionary<boolean>
  channels: Dictionary<Channel>
  privateChats: Dictionary<PrivateChat>
}

export const chatModule: Vuex.Module<ChatState, RootState> = {
  state: {
    identity: '',
    friends: {},
    ignored: {},
    admins: {},
    characters: {},
    channelList: [],
    joinedChannels: {},
    channels: {},
    privateChats: {},
  },
  mutations: {
    SET_IDENTITY(state, identity) {
      state.identity = identity
    },

    SET_FRIENDS(state, friends: string[]) {
      state.friends = fromPairs(friends.map(name => [name, true]))
    },

    ADD_FRIEND(state, name) {
      Vue.set(state.friends, name, true)
    },

    REMOVE_FRIEND(state, name) {
      Vue.delete(state.friends, name)
    },

    SET_IGNORED(state, ignored: string[]) {
      state.ignored = fromPairs(ignored.map(name => [name, true]))
    },

    SET_ADMINS(state, admins: string[]) {
      state.admins = fromPairs(admins.map(name => [name, true]))
    },

    CLEAR_CHANNEL_LIST(state) {
      state.channelList = []
    },

    UPDATE_CHANNEL_LIST(state, channels) {
      state.channelList.push(...channels)
    },

    ADD_JOINED_CHANNEL(state, id) {
      Vue.set(state.joinedChannels, id, true)
    },

    REMOVE_JOINED_CHANNEL(state, id) {
      Vue.delete(state.joinedChannels, id)
    },

    ADD_CHANNEL(state, { id }) {
      if (state.channels[id] == null) {
        Vue.set(state.channels, id, new Channel(id))
      }
    },

    REMOVE_CHANNEL(state, { id }) {
      Vue.delete(state.channels, id)
    },

    SET_CHANNEL_TITLE(state, { id, title }) {
      state.channels[id].title = title
    },

    SET_CHANNEL_DESCRIPTION(state, { id, description }) {
      state.channels[id].description = description
    },

    SET_CHANNEL_MODE(state, { id, mode }) {
      state.channels[id].mode = mode
    },

    SET_CHANNEL_USERS(state, { id, users }) {
      state.channels[id].users = users
    },

    SET_CHANNEL_OPS(state, { id, ops }) {
      state.channels[id].ops = ops
    },

    ADD_CHANNEL_USER(state, { id, name }) {
      state.channels[id].users.push(name)
    },

    REMOVE_CHANNEL_USER(state, { id, name }) {
      const channel = state.channels[id]
      channel.users = channel.users.filter(user => user !== name)
    },

    ADD_CHANNEL_MESSAGE(state, { id, sender, text, type }) {
      state.channels[id].messages.push(new Message(sender, text, type))
    },

    ADD_CHARACTER(state, { name, gender, status, statusMessage = '' }) {
      Vue.set(state.characters, name, new Character(name, gender, status, statusMessage))
    },

    ADD_CHARACTER_BATCH(state, batch) {
      const map = {} as Dictionary<Character>
      for (const [name, gender, status, statusMessage] of batch) {
        map[name] = new Character(name, gender, status, statusMessage)
      }
      state.characters = Object.assign(state.characters, map)
    },

    REMOVE_CHARACTER(state, name) {
      Vue.delete(state.characters, name)
      for (const channel of Object.values(state.channels)) {
        channel.users = channel.users.filter(user => user !== name)
      }
    },

    SET_CHARACTER_STATUS(state, { name, status, statusMessage }) {
      const char = state.characters[name]
      if (char) {
        char.status = status
        char.statusMessage = statusMessage
      }
    },

    ADD_PRIVATE_CHAT(state, name) {
      if (state.privateChats[name] == null) {
        Vue.set(state.privateChats, name, new PrivateChat(name))
      }
    },

    REMOVE_PRIVATE_CHAT(state, name) {
      Vue.delete(state.privateChats, name)
    },

    ADD_PRIVATE_CHAT_MESSAGE(state, { partner, sender, text }) {
      state.privateChats[partner].messages.push(new Message(sender, text, 'normal'))
    },
  },
  actions: {
    connectToServer({ state, dispatch }, { account, ticket }) {
      socket = new WebSocket('wss://chat.f-list.net:9799')

      socket.onopen = () => {
        const params = {
          account,
          ticket,
          character: state.identity,
          cname: process.env.APP_NAME,
          cversion: process.env.APP_VERSION,
          method: 'ticket',
        }
        dispatch('sendSocketCommand', { cmd: 'IDN', params })
      }

      socket.onmessage = msg => {
        const data = msg.data
        const cmd = data.slice(0, 3)
        const params = data.length > 3 ? JSON.parse(data.slice(4)) : {}
        dispatch('handleSocketCommand', { cmd, params })
      }

      socket.onclose = socket.onerror = () => {
        dispatch('disconnectFromServer')
      }
    },

    disconnectFromServer() {
      if (socket) socket.close()
      socket = undefined
    },

    sendSocketCommand(context, { cmd, params }) {
      if (socket) {
        if (params == null) {
          socket.send(cmd)
        } else {
          socket.send(cmd + ' ' + JSON.stringify(params))
        }
      }
    },

    fetchChannelList({ commit, dispatch }) {
      commit('CLEAR_CHANNEL_LIST')
      dispatch('sendSocketCommand', { cmd: 'CHA' })
      dispatch('sendSocketCommand', { cmd: 'ORS' })
    },

    joinChannel({ commit, dispatch }, id) {
      commit('ADD_CHANNEL', { id })
      commit('ADD_JOINED_CHANNEL', id)
      dispatch('sendSocketCommand', { cmd: 'JCH', params: { channel: id } })
      dispatch('saveJoinedChannels')
    },

    leaveChannel({ commit, dispatch }, id) {
      commit('REMOVE_JOINED_CHANNEL', id)
      dispatch('sendSocketCommand', { cmd: 'LCH', params: { channel: id } })
      dispatch('saveJoinedChannels')
    },

    sendChannelMessage({ state, dispatch, commit }, { id, message }) {
      dispatch('sendSocketCommand', {
        cmd: 'MSG',
        params: { channel: id, message },
      })
      commit('ADD_CHANNEL_MESSAGE', {
        id,
        sender: state.identity,
        text: message,
        type: 'normal',
      })
    },

    async saveJoinedChannels({ state }) {
      const channels = Object.keys(state.joinedChannels)
      await forage.setItem('joinedChannels:' + state.identity, channels)
    },

    async restoreJoinedChannels({ dispatch, state }) {
      const channels = await forage.getItem<string[]>('joinedChannels:' + state.identity)
      for (const id of channels || []) {
        dispatch('joinChannel', id)
      }
    },

    sendPrivateMessage({ dispatch, commit, state }, { recipient, message }) {
      dispatch('sendSocketCommand', {
        cmd: 'PRI',
        params: { recipient, message },
      })
      commit('ADD_PRIVATE_CHAT_MESSAGE', {
        partner: recipient,
        sender: state.identity,
        text: message,
      })
    },

    openPrivateChat({ state, commit }, partner) {
      if (state.privateChats[partner] == null) {
        commit('ADD_PRIVATE_CHAT', partner)
      }
    },

    async savePrivateChats({ state }) {
      await forage.setItem('privateChats:' + state.identity, Object.keys(state.privateChats))
    },

    async restorePrivateChats({ commit, state }) {
      const partners = await forage.getItem<string[]>('privateChats:' + state.identity)
      for (const name of partners || []) {
        commit('ADD_PRIVATE_CHAT', name)
      }
    },

    handleSocketCommand({ state, commit, dispatch }, { cmd, params }) {
      const handlers: { [command: string]: () => void } = {
        PIN() {
          dispatch('sendSocketCommand', { cmd: 'PIN' })
        },

        IDN() {
          console.info('Successfully connected to server')
          dispatch('restoreJoinedChannels')
          dispatch('restorePrivateChats')
        },

        VAR() {},

        HLO() {
          console.info(params.message)
        },

        CON() {
          console.info(`There are ${params.count} characters in chat`)
        },

        FRL() {
          commit('SET_FRIENDS', params.characters)
        },

        IGN() {
          if (params.action === 'init') {
            commit('SET_IGNORED', params.characters)
          }
        },

        ADL() {
          commit('SET_ADMINS', params.ops)
        },

        LIS() {
          commit('ADD_CHARACTER_BATCH', params.characters)
        },

        NLN() {
          commit('ADD_CHARACTER', {
            name: params.identity,
            gender: params.gender,
            status: 'online',
          })
        },

        FLN() {
          commit('REMOVE_CHARACTER', params.character)
        },

        STA() {
          commit('SET_CHARACTER_STATUS', {
            name: params.character,
            status: params.status,
            statusmsg: params.statusMessage,
          })
        },

        CHA() {
          const channels = params.channels.map((ch: { name: string; characters: number }) => {
            return new ChannelInfo('public', ch.name, ch.name, ch.characters)
          })
          commit('UPDATE_CHANNEL_LIST', channels)
        },
        ORS() {
          const channels = params.channels.map(
            (ch: { name: string; title: string; characters: number }) => {
              return new ChannelInfo('private', ch.name, ch.title, ch.characters)
            },
          )
          commit('UPDATE_CHANNEL_LIST', channels)
        },

        JCH() {
          const name = params.character.identity
          if (name === state.identity) {
            commit('ADD_JOINED_CHANNEL', params.channel)
            commit('SET_CHANNEL_TITLE', {
              id: params.channel,
              title: params.title,
            })
          }
          commit('ADD_CHANNEL_USER', { id: params.channel, name })
        },

        LCH() {
          if (params.character === state.identity) {
            commit('REMOVE_JOINED_CHANNEL', params.channel)
          }
          commit('REMOVE_CHANNEL_USER', {
            id: params.channel,
            name: params.character,
          })
        },

        ICH() {
          commit('SET_CHANNEL_MODE', { id: params.channel, mode: params.mode })
          commit('SET_CHANNEL_USERS', {
            id: params.channel,
            users: params.users.map((user: { identity: string }) => user.identity),
          })
        },

        CDS() {
          commit('SET_CHANNEL_DESCRIPTION', {
            id: params.channel,
            description: params.description,
          })
        },

        COL() {
          commit('SET_CHANNEL_OPS', { id: params.channel, ops: params.oplist })
        },

        MSG() {
          commit('ADD_CHANNEL_MESSAGE', {
            id: params.channel,
            sender: params.character,
            text: params.message,
            type: 'normal',
          })
        },

        LRP() {
          commit('ADD_CHANNEL_MESSAGE', {
            id: params.channel,
            sender: params.character,
            text: params.message,
            type: 'lfrp',
          })
        },

        PRI() {
          commit('ADD_PRIVATE_CHAT', params.character)
          commit('ADD_PRIVATE_CHAT_MESSAGE', {
            partner: params.character,
            sender: params.character,
            text: params.message,
          })
          dispatch('savePrivateChats')
        },

        RTB() {
          // TODO
          // Friend Request: {type: 'friendadd', name: '...'}
          // Friend Request accepted: {type: 'trackrem(?)', name: '...'}

          // bookmark added
          if (params.type === 'trackadd') commit('ADD_FRIEND', params.name)

          // bookmark removed
          if (params.type === 'trackrem') commit('REMOVE_FRIEND', params.name)
        },
      }

      if (handlers[cmd]) {
        handlers[cmd]()
      } else {
        console.log(cmd, params)
      }
    },
  },
  getters: {
    getCharacter: state => (name: string) =>
      state.characters[name] || new Character(name, 'none', 'offline'),
  },
}
