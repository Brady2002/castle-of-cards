// === Event Definitions ===

export type EventChoice = {
  label: string
  outcome: EventOutcome
}

export type EventOutcome = {
  description: string
  hpChange?: number
  maxHpChange?: number
  sandDollarsChange?: number
  removeCard?: boolean
  random?: { outcomes: EventOutcome[]; weights: number[] }
}

export type GameEvent = {
  id: string
  title: string
  description: string
  choices: EventChoice[]
}

const ALL_EVENTS: GameEvent[] = [
  {
    id: 'tide_pool',
    title: 'Mysterious Tide Pool',
    description: 'You find a shimmering tide pool. Strange creatures swim in its depths. Do you reach inside?',
    choices: [
      {
        label: 'Look Inside',
        outcome: {
          description: '',
          random: {
            outcomes: [
              { description: 'A gentle warmth flows through you. Healed 15 HP!', hpChange: 15 },
              { description: 'Something stings you! Took 8 damage.', hpChange: -8 },
            ],
            weights: [50, 50],
          },
        },
      },
      {
        label: 'Walk Away',
        outcome: { description: 'You leave the tide pool undisturbed.' },
      },
    ],
  },
  {
    id: 'stash',
    title: "Beachcomber's Stash",
    description: 'Half-buried in the sand, you find a weathered chest left behind by another beachcomber.',
    choices: [
      {
        label: 'Open It',
        outcome: { description: 'Inside you find a pouch of sand dollars! Gained $15.', sandDollarsChange: 15 },
      },
    ],
  },
  {
    id: 'shrine',
    title: 'Sand Dollar Shrine',
    description: 'A small shrine made of stacked shells and sand dollars sits atop a dune. An inscription reads: "Leave an offering, gain vitality."',
    choices: [
      {
        label: 'Offer $15',
        outcome: { description: 'The shrine glows warmly. You feel stronger! +5 Max HP.', sandDollarsChange: -15, maxHpChange: 5 },
      },
      {
        label: 'Leave',
        outcome: { description: 'You move on, keeping your sand dollars.' },
      },
    ],
  },
  {
    id: 'crab_hermit',
    title: 'Crab Hermit',
    description: 'An ancient hermit crab, shell covered in barnacles, offers to lighten your load. "Too many tools weigh you down," it clicks.',
    choices: [
      {
        label: 'Remove a Card',
        outcome: { description: 'The hermit crab dissolves one of your cards into sea foam.', removeCard: true },
      },
      {
        label: 'Decline',
        outcome: { description: '"Suit yourself," the crab mutters, retreating into its shell.' },
      },
    ],
  },
  {
    id: 'sunken_treasure',
    title: 'Sunken Treasure',
    description: 'You spot a glint of gold beneath the shallow surf. The rocks around it look sharp.',
    choices: [
      {
        label: 'Dive In ($20, -10 HP)',
        outcome: { description: 'You scrape yourself on the rocks but grab the treasure! Gained $20, took 10 damage.', sandDollarsChange: 20, hpChange: -10 },
      },
      {
        label: 'Leave It',
        outcome: { description: 'Not worth the risk. You keep walking.' },
      },
    ],
  },
  {
    id: 'healing_spring',
    title: 'Healing Spring',
    description: 'A natural spring bubbles up through the sand, its waters warm and restorative.',
    choices: [
      {
        label: 'Drink',
        outcome: { description: 'The warm water soothes your wounds. Healed 25% HP!', hpChange: -1 }, // -1 signals percentage heal
      },
    ],
  },
]

export function getRandomEvent(exclude?: string[]): GameEvent {
  const available = exclude
    ? ALL_EVENTS.filter(e => !exclude.includes(e.id))
    : ALL_EVENTS
  const pool = available.length > 0 ? available : ALL_EVENTS
  return pool[Math.floor(Math.random() * pool.length)]
}

export function resolveEventOutcome(outcome: EventOutcome): EventOutcome {
  if (outcome.random) {
    // Weighted random selection
    const { outcomes, weights } = outcome.random
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    let roll = Math.random() * totalWeight
    for (let i = 0; i < outcomes.length; i++) {
      roll -= weights[i]
      if (roll <= 0) return outcomes[i]
    }
    return outcomes[outcomes.length - 1]
  }
  return outcome
}
