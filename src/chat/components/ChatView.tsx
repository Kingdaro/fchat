import { action, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import * as React from 'react'

import { ChannelBrowser } from 'src/channel-browser/components/ChannelBrowser'
import { ChannelView } from 'src/channel/components/ChannelView'
import { ChannelStore } from 'src/channel/stores/ChannelStore'
import { ChatStore } from 'src/chat/stores/ChatStore'
import { Drawer } from 'src/common/components/Drawer'
import { Overlay } from 'src/common/components/Overlay/Overlay'
import { ShowOnDesktop } from 'src/common/components/responsive-utils'

import { ChatHeader } from './ChatHeader'
import { ChatMenu } from './ChatMenu'

type ChatProps = {
  channelStore?: ChannelStore
  chatStore?: ChatStore
}

@inject('chatStore', 'channelStore')
@observer
export class ChatView extends React.Component<ChatProps> {
  @observable isMenuOpen = false
  @observable isChannelBrowserOpen = true // DEBUG: disable this when implemented
  @observable currentChannel = ''

  @action.bound
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen
  }

  @action.bound
  toggleChannelBrowser() {
    const open = (this.isChannelBrowserOpen = !this.isChannelBrowserOpen)
    if (open) {
      this.props.chatStore!.fetchChannelList()
    }
  }

  @action.bound
  setCurrentChannel(id: string) {
    this.currentChannel = id
  }

  @action.bound
  handleChannelActivate(channel: string) {
    this.currentChannel = channel
    this.isMenuOpen = false
  }

  renderMenu() {
    return (
      <ChatMenu
        activeChannel={this.currentChannel}
        channelBrowserAction={this.toggleChannelBrowser}
        onChannelActivate={this.handleChannelActivate}
      />
    )
  }

  renderChannelView() {
    return (
      <ChannelView
        className="flex-grow"
        onMenuClicked={this.toggleMenu}
        onMoreClicked={console.log}
        channelID={this.currentChannel}
      />
    )
  }

  renderHeaderTitle() {
    if (this.currentChannel) {
      return this.props.channelStore!.getChannel(this.currentChannel).title
    }
    return 'next'
  }

  render() {
    return (
      <main className="bg-color-darken-3 fullscreen flex-row">
        <ShowOnDesktop className="flex-row">
          {this.renderMenu()}
          <div className="divider-h" />
        </ShowOnDesktop>

        <section className="flex-grow flex-column">
          <ChatHeader
            title={this.renderHeaderTitle()}
            onMenuClicked={this.toggleMenu}
            onMoreClicked={console.log}
          />
          {this.currentChannel && this.renderChannelView()}
        </section>

        <Drawer side="left" visible={this.isMenuOpen} onShadeClicked={this.toggleMenu}>
          {this.renderMenu()}
        </Drawer>

        <Overlay visible={this.isChannelBrowserOpen} onShadeClick={this.toggleChannelBrowser}>
          <div className="bg-color-main" style={{ width: '320px', height: '600px' }}>
            <ChannelBrowser onDone={this.toggleChannelBrowser} />
          </div>
        </Overlay>
      </main>
    )
  }
}
