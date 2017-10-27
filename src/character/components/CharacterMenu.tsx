import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { getProfileURL } from 'src/api'
import { Icon } from 'src/app/components/Icon'
import { CharacterDetails } from 'src/character/components/CharacterDetails'
import styled from 'styled-components'

type CharacterMenuProps = {
  x: number
  y: number
  character: string
}

const MenuWrapper = styled.div`
  width: 200px;
  position: fixed;
  box-shadow: 0px 0px 8px black;
`

const MenuAction = styled.a`
  opacity: 0.5;

  &:hover {
    opacity: 1;
  }
`

export class CharacterMenu extends React.Component<CharacterMenuProps> {
  updatePosition() {
    const el = ReactDOM.findDOMNode(this) as HTMLElement
    const rect = el.getBoundingClientRect()
    const { x, y } = this.props

    console.log(rect, document.body.getBoundingClientRect())

    el.style.left = x + 'px'
    el.style.top = y + 'px'

    let transform = ''

    if (x + rect.width > window.innerWidth) {
      transform += ' translateX(-100%)'
    }

    if (y + rect.height > window.innerHeight) {
      transform += ' translateY(-100%)'
    }

    el.style.transform = transform
  }

  componentDidMount() {
    this.updatePosition()
  }

  componentDidUpdate() {
    this.updatePosition()
  }

  render() {
    const { character } = this.props
    return (
      <MenuWrapper className="bg-color-darken-1 flex-column">
        <div className="bg-color-main">
          <CharacterDetails name={character} />
        </div>
        <MenuAction className="padding" href="#">
          <Icon name="message" /> Send Message
        </MenuAction>
        <MenuAction className="padding" href={getProfileURL(character)} target="_blank">
          <Icon name="link" /> Open Profile
        </MenuAction>
        <MenuAction className="padding" href="#">
          <Icon name="remove-circle" /> Ignore
        </MenuAction>
      </MenuWrapper>
    )
  }
}
