import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  account: '',
  userData: {},
  loggedIn: false,
  loginStatusMessage: '',
  character: ''
}

const mutations = {
  LOGIN_REQUEST (state, account) {
    state.account = account
    state.loginStatusMessage = 'Hold on...'
  },

  LOGIN_SUCCESS (state, data) {
    state.userData = data
    state.loggedIn = true
    state.loginStatusMessage = 'Success!'
  },

  LOGIN_FAILURE (state, err) {
    state.loginStatusMessage = err
  },

  CHOOSE_CHARACTER (state, char) {
    state.character = char
  }
}

export default new Vuex.Store({ state, mutations })
