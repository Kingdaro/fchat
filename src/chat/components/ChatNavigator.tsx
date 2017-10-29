import { inject, observer } from 'mobx-react'
import * as React from 'react'
import { CharacterDetails } from 'src/character/components/CharacterDetails'
import { ChatAction } from 'src/chat/components/ChatAction'
import { Stores } from 'src/stores'
import { ChatNavigatorTabs } from './ChatNavigatorTabs'

type InjectedProps = {
  identity: string
  onChannelBrowser: () => void
  onStatusMenu: () => void
  onFriendBrowser: () => void
  onExit: () => void
  onInfo: () => void
}

function storesToProps(stores: Stores): InjectedProps {
  const { chatStore, chatViewStore, appStore } = stores
  return {
    identity: chatStore.identity,
    onStatusMenu: chatViewStore.statusMenu.show,
    onFriendBrowser: chatViewStore.friendBrowser.show,

    onChannelBrowser() {
      chatViewStore.channelBrowser.show()
      chatStore.fetchChannelList()
    },

    onExit() {
      chatStore.disconnectFromServer()
    },

    onInfo() {
      appStore.appInfo.toggle()
    },
  }
}

@inject(storesToProps)
@observer
class ChatNavigatorComponent extends React.Component<InjectedProps> {
  render() {
    return (
      <div className="bg-color-main flex-row full-height" style={{ width: '240px' }}>
        <div className="bg-color-darken-2 flex-column">
          <section className="flex-grow flex-column">
            <ChatAction icon="forum" onClick={this.props.onChannelBrowser} />
            <ChatAction icon="account-circle" onClick={this.props.onStatusMenu} />
            <ChatAction icon="account-multiple" onClick={this.props.onFriendBrowser} />
            <ChatAction icon="info" onClick={this.props.onInfo} />
            {/* <ChatAction icon="settings" /> */}
          </section>

          <section className="flex-column">
            <ChatAction icon="exit" onClick={this.props.onExit} />
          </section>
        </div>

        <div className="flex-grow flex-column flex-align-stretch">
          <CharacterDetails name={this.props.identity} />

          <div className="bg-color-darken-2 divider-v" />

          <ChatNavigatorTabs />
        </div>
      </div>
    )
  }
}

export const ChatNavigator: React.ComponentClass = ChatNavigatorComponent
