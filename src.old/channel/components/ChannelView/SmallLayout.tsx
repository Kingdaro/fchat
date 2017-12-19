import { observer } from 'mobx-react'
import * as React from 'react'
import { Channel } from 'src/channel/models/Channel'
import { ChatInput } from 'src/chat/components/ChatInput'
import { Drawer } from 'src/common/components/Drawer'
import { Fragment } from 'src/common/components/Fragment'
import { scrollVertical } from 'src/common/styles/helpers'
import { Grid } from 'src/ui/components'
import { OverlayViewModel } from 'src/ui/models/OverlayViewModel'
import { Description } from './Description'
import { Header } from './Header'
import { MessageList } from './MessageList'
import { UserList } from './UserList'

type Props = {
  channel: Channel
  infoDrawer: OverlayViewModel
}

export const SmallLayout = observer(function(props: Props) {
  return (
    <Fragment>
      <Grid rows="auto 1fr 80px" className="fill-area">
        <Header channel={props.channel} onMore={props.infoDrawer.show} />
        <MessageList messages={props.channel.filteredMessages} />
        <ChatInput />
      </Grid>

      <Drawer side="right" visible={props.infoDrawer.isOpen} onShadeClicked={props.infoDrawer.hide}>
        <div className={scrollVertical} style={{ width: '240px' }}>
          <Description text={props.channel.parsedDescription} />
          <UserList users={props.channel.users} ops={props.channel.ops} />
        </div>
      </Drawer>
    </Fragment>
  )
})
