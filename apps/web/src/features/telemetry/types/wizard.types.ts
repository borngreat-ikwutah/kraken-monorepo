export type WizardStep = 1 | 2 | 3

export type WizardChoice = "url" | "email" | "flow"

export interface WizardCopy {
  title: string
  description: string
  exampleHint: string
}
