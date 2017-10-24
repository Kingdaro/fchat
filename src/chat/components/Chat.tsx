import * as React from 'react'

import { action, observable } from 'mobx'
import { observer } from 'mobx-react'

import { Drawer } from 'src/common/components/Drawer'
import { ShowOnDesktop } from 'src/common/components/responsive-utils'

import { ChannelView } from './ChannelView'
import { ChatMenu } from './ChatMenu'

type ChatProps = {}

@observer
export class Chat extends React.Component<ChatProps> {
  @observable isMenuOpen = false

  @action.bound
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen
  }

  render() {
    return (
      <main className="bg-color-darken-3 fullscreen flex-row">
        <ShowOnDesktop className="flex-row">
          <ChatMenu />
          <div className="divider-h" />
        </ShowOnDesktop>

        <Drawer side="left" visible={this.isMenuOpen} onShadeClicked={this.toggleMenu}>
          <ChatMenu />
        </Drawer>

        <section className="flex-grow flex-column">
          <ChannelView
            className="flex-grow"
            onMenuClicked={this.toggleMenu}
            onMoreClicked={console.log}
          />
        </section>
      </main>
    )
  }
}
