import { observer } from "mobx-react"
import * as React from "react"
import { ChannelUsers } from "src/channel/components/ChannelUsers"
import { Channel } from "src/channel/models/Channel"
import { OverlayState } from "src/chat/models/OverlayState"
import { Drawer } from "src/common/components/Drawer"

type Props = { channel: Channel; infoDrawerOverlay: OverlayState }

@observer
export class ChannelViewDrawer extends React.Component<Props> {
  render() {
    return (
      <Drawer
        side="right"
        visible={this.props.infoDrawerOverlay.isOpen}
        onShadeClicked={this.props.infoDrawerOverlay.hide}
      >
        <div className="scroll-v" style={{ width: "240px" }}>
          <h3 className="padding">Description</h3>
          <div
            className="bg-color-darken-1 padding preserve-ws"
            dangerouslySetInnerHTML={this.props.channel.parsedDescription}
          />

          <h3 className="padding">Users ({this.props.channel.getUserCount()})</h3>
          <div className="bg-color-darken-1">
            <ChannelUsers users={this.props.channel.getUsers()} ops={this.props.channel.ops} />
          </div>
        </div>
      </Drawer>
    )
  }
}
