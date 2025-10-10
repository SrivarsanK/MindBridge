const adjectives = ["Calm", "Steady", "Quiet", "Kind", "Bright", "Brave", "Gentle", "Clear"]
const nouns = ["River", "Cedar", "Harbor", "Willow", "Summit", "Meadow", "Aurora", "Horizon"]

export function generatePseudonym() {
  const a = adjectives[Math.floor(Math.random() * adjectives.length)]
  const n = nouns[Math.floor(Math.random() * nouns.length)]
  return `${a}${n}`
}
