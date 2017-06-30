import { action, observable } from 'mobx'
import * as flist from './lib/f-list'

export enum AppView {
  loading,
  login,
  characterSelect,
  chat,
}

export class AppStore {
  account = ''
  ticket = ''
  @observable characters = [] as string[]
  @observable identity = ''
  @observable loginStatus = ''
  @observable view = AppView.loading

  @action
  loadUserData() {
    this.account = localStorage.getItem('account') || ''
    this.ticket = localStorage.getItem('ticket') || ''
  }

  @action
  saveUserData() {
    localStorage.setItem('account', this.account)
    localStorage.setItem('ticket', this.ticket)
  }

  @action
  async fetchTicket(account: string, password: string) {
    this.account = account
    this.ticket = await flist.fetchTicket(this.account, password)
  }

  @action
  async fetchCharacters() {
    this.characters = await flist.fetchCharacters(this.account, this.ticket)
  }

  @action
  setView(view: AppView) {
    this.view = view
  }

  @action
  setLoginStatus(status: string) {
    this.loginStatus = status
  }

  @action
  setIdentity(identity: string) {
    this.identity = identity
  }

  async init() {
    this.setView(AppView.loading)
    try {
      this.loadUserData()
      await this.fetchCharacters()
      this.setView(AppView.characterSelect)
    } catch (err) {
      this.setView(AppView.login)
    }
  }
}
