import { bind } from 'decko'
import { Formik, FormikProps, FormikConfig } from 'formik'
import * as React from 'react'
import { getAvatarURL } from 'src/api'
import { preventDefault } from 'src/common/util/react'
import { StoredValue } from 'src/common/util/storage'
import { Button, Link, Select } from 'src/ui/components'

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

class CharacterSelectForm extends Formik<FormikConfig<FormValues>> {}

export class CharacterSelect extends React.Component<CharacterSelectProps> {
  render() {
    const handleBack = preventDefault(this.props.onBack)

    return (
      <section className="text-center">
        <h1>Choose your identity.</h1>
        <CharacterSelectForm
          initialValues={{ character: this.props.characters[0] }}
          render={this.renderForm}
          onSubmit={this.handleSubmit}
          ref={this.initializeValues}
        />
        <p>
          <Link onClick={handleBack}>Back</Link>
        </p>
      </section>
    )
  }

  @bind
  private async initializeValues(form: CharacterSelectForm | null) {
    if (!form) return
    const character = await storedCharacter.restore()
    form.setFieldValue('character', character || '')
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
          <Select name="character" value={character} onChange={props.handleChange}>
            {this.props.characters.map(name => <option key={name}>{name}</option>)}
          </Select>
        </fieldset>
        <fieldset>
          <Button type="submit">Submit</Button>
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
