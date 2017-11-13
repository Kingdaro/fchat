import { action, observable } from 'mobx'
import { Character } from 'src/character/models/Character'

type CharacterBatch = [string, string, string, string][]

export class CharacterStore {
  characters = observable.map<Character>()

  @action
  getCharacter(name: string) {
    let char = this.characters.get(name)
    if (!char) {
      char = new Character(name, 'None', 'offline')
      this.characters.set(name, char)
    }
    return char
  }

  @action
  handleCharacterBatch(batch: CharacterBatch) {
    const newCharacters = {} as Dictionary<Character>

    batch.forEach(([name, gender, status, statusMessage]) => {
      const char = this.characters.get(name)

      if (char) {
        char.gender = gender
        char.status = status
        char.statusMessage = statusMessage
      } else {
        newCharacters[name] = new Character(name, gender, status, statusMessage)
      }
    })

    this.characters.merge(newCharacters)
  }
}
