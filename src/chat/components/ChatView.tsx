import { action } from 'mobx'
import { inject, observer } from 'mobx-react'
import * as React from 'react'
import { ChannelBrowser } from 'src/channel-browser/components/ChannelBrowser'
import { ChannelView } from 'src/channel/components/ChannelView'
import { ChannelStore } from 'src/channel/stores/ChannelStore'
import { CharacterMenu } from 'src/character/components/CharacterMenu'
import { ChatStore } from 'src/chat/stores/ChatStore'
import { ChatViewStore } from 'src/chat/stores/ChatViewStore'
import { Drawer } from 'src/common/components/Drawer'
import { FadeTransition } from 'src/common/components/FadeTransition'
import { Overlay } from 'src/common/components/Overlay/Overlay'
import { ShowOnDesktop } from 'src/common/components/responsive-utils'
import { PrivateChatView } from 'src/private-chat/components/PrivateChatView'
import styled from 'styled-components'
import { ChatHeader } from './ChatHeader'
import { ChatNavigator } from './ChatNavigator'
import { StatusMenu } from './StatusMenu'

const ChannelBrowserWrapper = styled.div`
  width: 400px;
  height: 600px;

  max-width: calc(100vw - 40px);
  max-height: calc(100vh - 40px);
`

type ChatProps = {
  channelStore?: ChannelStore
  chatStore?: ChatStore
  chatViewStore?: ChatViewStore
}

@inject('chatStore', 'chatViewStore', 'channelStore')
@observer
export class ChatView extends React.Component<ChatProps> {
  viewStore = this.props.chatViewStore!

  @action.bound
  handleChannelActivate(channel: string) {
    this.viewStore.setRoute({ type: 'channel', id: channel })
    this.viewStore.isNavigatorOpen = false
  }

  @action.bound
  handleClick() {
    this.viewStore.closeCharacterMenu()
  }

  @action.bound
  handleContextMenu(event: React.MouseEvent<HTMLElement>) {
    const el = event.target
    if (el instanceof HTMLElement && el.dataset && el.dataset.character) {
      event.preventDefault()
      this.viewStore.openCharacterMenu(el.dataset.character!, event.clientX, event.clientY)
    }
  }

  renderRoute() {
    const { route } = this.viewStore
    if (route.type === 'channel') {
      return <ChannelView id={route.id} />
    }
    if (route.type === 'private-chat') {
      return <PrivateChatView partner={route.partner} />
    }
    return (
      <ChatHeader>
        <h3>next</h3>
      </ChatHeader>
    )
  }

  renderSidebarMenu() {
    return (
      <ShowOnDesktop className="flex-row">
        {this.renderMenu()}
        <div className="divider-h" />
      </ShowOnDesktop>
    )
  }

  renderMenu() {
    return <ChatNavigator />
  }

  renderDrawerMenu() {
    return (
      <Drawer
        side="left"
        visible={this.viewStore.isNavigatorOpen}
        onShadeClicked={this.viewStore.toggleNavigator}
      >
        {this.renderMenu()}
      </Drawer>
    )
  }

  renderChannelBrowser() {
    return (
      <FadeTransition visible={this.viewStore.isChannelBrowserOpen}>
        <Overlay onShadeClick={this.viewStore.toggleChannelBrowser}>
          <ChannelBrowserWrapper className="bg-color-main">
            <ChannelBrowser onDone={this.viewStore.toggleChannelBrowser} />
          </ChannelBrowserWrapper>
        </Overlay>
      </FadeTransition>
    )
  }

  renderStatusMenu() {
    return (
      <FadeTransition visible={this.viewStore.isStatusMenuOpen}>
        <Overlay onShadeClick={this.viewStore.toggleStatusMenu}>
          <StatusMenu />
        </Overlay>
      </FadeTransition>
    )
  }

  renderCharacterMenu() {
    const { open, ...props } = this.viewStore.characterMenu
    return (
      <FadeTransition visible={open}>
        <CharacterMenu {...props} />
      </FadeTransition>
    )
  }

  render() {
    return (
      <main
        className="bg-color-darken-3 fullscreen flex-row"
        onClick={this.handleClick}
        onContextMenu={this.handleContextMenu}
      >
        {this.renderSidebarMenu()}

        <section className="flex-grow flex-column">{this.renderRoute()}</section>

        {this.renderDrawerMenu()}

        {this.renderChannelBrowser()}
        {this.renderStatusMenu()}

        {this.renderCharacterMenu()}
      </main>
    )
  }
}
