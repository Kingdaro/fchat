import {state} from '../store'
import parseBBC from '../parse-bbc'
import * as flist from '../f-list'

export default class Character {
  constructor (name, gender, status = 'online', statusmsg = '') {
    this.name = name
    this.gender = gender.toLowerCase()
    this.setStatus(status, statusmsg)
    this.onlineTime = Date.now()
  }

  setStatus (status, message) {
    this.status = status
    this.statusmsg = parseBBC(message)
  }

  get friends () {
    return state.friends
      .filter(entry => entry.them === this.name)
      .map(entry => entry.you)
  }

  get isFriend () {
    return this.friends.length > 0
  }

  get isBookmark () {
    return state.bookmarks.includes(this.name)
  }

  get isIgnored () {
    return state.ignored.includes(this.name)
  }

  get isAdmin () {
    return state.admins.includes(this.name)
  }

  get avatarURL () {
    return flist.getAvatarURL(this.name)
  }

  get profileURL () {
    return flist.getProfileURL(this.name)
  }
}
