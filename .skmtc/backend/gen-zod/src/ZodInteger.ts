import { ContentBase } from '@skmtc/core'
import { applyModifiers } from './applyModifiers.ts'
import type { GenerateContextType, Modifiers, OasInteger, GeneratorKey } from '@skmtc/core'

type ZodIntegerArgs = {
  context: GenerateContextType
  integerSchema: OasInteger
  modifiers: Modifiers
  destinationPath: string
  generatorKey: GeneratorKey
}

export class ZodInteger extends ContentBase {
  type = 'integer' as const
  modifiers: Modifiers
  format?: 'int32' | 'int64'
  enums?: number[] | (number | null)[]
  isNonNegative: boolean
  title: string | undefined

  constructor({
    context,
    integerSchema,
    modifiers,
    destinationPath,
    generatorKey
  }: ZodIntegerArgs) {
    super({ context, generatorKey })

    this.isNonNegative = Boolean(integerSchema.minimum === 0 && integerSchema.title)

    this.title =
      typeof integerSchema === 'object' && 'title' in integerSchema
        ? integerSchema.title
        : undefined

    this.format = integerSchema.format
    this.enums = integerSchema.enums
    this.modifiers = modifiers

    context.register({ imports: { zod: ['z'] }, destinationPath })
  }

  override toString(): string {
    const { enums } = this

    let content: string
    if (enums && Array.isArray(enums)) {
      content =
        enums.length === 1
          ? `z.literal(${enums[0]})`
          : `z.union([${enums.map(e => `z.literal(${e})`).join(', ')}])`
    } else {
      content = this.isNonNegative
        ? `z.number().int().nonnegative("${this.title} must be non-negative")`
        : `z.number().int()`
    }

    return applyModifiers(content, this.modifiers)
  }
}
