import Vue from 'vue'
import Vuex from 'vuex'
import { authModule, AuthState } from './auth-module'
import { chatModule, ChatState } from './chat-module'

Vue.use(Vuex)

export type RootState = {
  user: AuthState
  chat: ChatState
}

export default new Vuex.Store({
  modules: {
    user: authModule,
    chat: chatModule,
  },
})
