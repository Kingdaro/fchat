import { bind } from 'decko'
import * as React from 'react'
import { getAvatarURL } from 'src/api'
import { preventDefault } from 'src/common/util/react'
import { StoredValue } from 'src/common/util/storage'
import { Formik, FormikProps } from 'formik'

const avatarStyle = {
  width: '100px',
  height: '100px',
}

type CharacterSelectProps = {
  characters: string[]
  onSubmit: (character: string) => void
  onBack: () => void
}

type FormValues = {
  character: string
}

const storedCharacter = new StoredValue<string>('CharacterSelect_character')

export class CharacterSelect extends React.Component<CharacterSelectProps> {
  form: Formik | null

  async componentDidMount() {
    if (this.form) {
      const character = await storedCharacter.restore()
      this.form.setFieldValue('character', character || '')
    }
  }

  render() {
    const handleBack = preventDefault(this.props.onBack)

    return (
      <section className="text-center">
        <h1>Choose your identity.</h1>
        <Formik
          initialValues={{ character: this.props.characters[0] }}
          render={this.renderForm}
          onSubmit={this.handleSubmit}
          ref={form => (this.form = form)}
        />
        <p>
          <a href="#" className="bbc-link" onClick={handleBack}>
            Back
          </a>
        </p>
      </section>
    )
  }

  @bind
  private renderForm(props: FormikProps<FormValues>) {
    const { character } = props.values
    const avatarURL = getAvatarURL(character)
    return [
      <p key="avatar">
        <img style={avatarStyle} src={avatarURL} alt={`Avatar for ${character}`} />
      </p>,
      <form key="form" onSubmit={props.handleSubmit}>
        <fieldset>
          <select name="character" value={character} onChange={props.handleChange}>
            {this.props.characters.map(name => <option key={name}>{name}</option>)}
          </select>
        </fieldset>
        <fieldset>
          <button type="submit">Submit</button>
        </fieldset>
      </form>,
    ]
  }

  @bind
  private handleSubmit(values: FormValues) {
    this.props.onSubmit(values.character)
    storedCharacter.save(values.character).catch(console.warn)
  }
}
