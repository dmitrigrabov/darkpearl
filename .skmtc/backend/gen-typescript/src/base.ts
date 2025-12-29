import { capitalize, Identifier, toModelBase, camelCase } from '@skmtc/core'
import type { RefName } from '@skmtc/core'
import { join } from '@std/path'

export const TypescriptBase = toModelBase({
  id: '@skmtc/gen-typescript',

  toIdentifier(refName: RefName): Identifier {
    const name = capitalize(camelCase(refName))

    return Identifier.createType(name)
  },

  toExportPath(): string {
    return join('@', 'models.generated.ts')
  }
})
