// === Map Types & Generation ===

export type MapNodeType = 'combat' | 'elite' | 'rest' | 'shop' | 'event' | 'boss'

export type DifficultyTier = 'easy' | 'medium' | 'hard'

export type MapNode = {
  id: string
  row: number
  col: number
  type: MapNodeType
  edges: string[] // IDs of nodes in next row this connects to
  visited: boolean
  enemyNames?: string[] // pre-assigned encounter
  difficulty?: DifficultyTier
}

export type GameMap = {
  nodes: MapNode[]
  currentNodeId: string | null
}

// === Encounter Pools ===

const EASY_ENCOUNTERS: string[][] = [
  ['Sand Crab', 'Sand Crab'],
  ['Seagull', 'Sand Crab'],
  ['Sand Flea', 'Sand Flea'],
  ['Jellyfish', 'Sand Flea'],
]

const MEDIUM_ENCOUNTERS: string[][] = [
  ['Hermit Crab', 'Seagull'],
  ['Pelican', 'Sand Flea'],
  ['Sea Urchin', 'Sea Urchin'],
  ['Jellyfish', 'Hermit Crab'],
  ['Sea Urchin', 'Seagull', 'Sand Crab'],
]

const HARD_ENCOUNTERS: string[][] = [
  ['Starfish', 'Hermit Crab', 'Sand Flea'],
  ['Pelican', 'Jellyfish', 'Sand Crab'],
  ['Starfish', 'Starfish', 'Sea Urchin'],
  ['Hermit Crab', 'Hermit Crab', 'Jellyfish', 'Seagull'],
]

const ELITE_ENCOUNTERS: string[][] = [
  ['Giant Coconut Crab'],
  ['Angry Pelican Flock'],
]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickEncounter(difficulty: DifficultyTier): string[] {
  switch (difficulty) {
    case 'easy': return pickRandom(EASY_ENCOUNTERS)
    case 'medium': return pickRandom(MEDIUM_ENCOUNTERS)
    case 'hard': return pickRandom(HARD_ENCOUNTERS)
  }
}

// === Row Definitions ===

type RowDef = {
  count: number | [number, number] // fixed or [min, max]
  types: MapNodeType[] | ((index: number, count: number) => MapNodeType)
  difficulty?: DifficultyTier
}

const ROW_DEFS: RowDef[] = [
  // Row 0: Easy combat, 3 nodes
  { count: 3, types: ['combat'], difficulty: 'easy' },
  // Row 1: Combat / Event, 3 nodes
  { count: 3, types: ['combat', 'combat', 'event'], difficulty: 'easy' },
  // Row 2: Combat / Event, 3 nodes
  { count: 3, types: ['combat', 'event', 'combat'], difficulty: 'easy' },
  // Row 3: Rest / Shop, 2-3 nodes
  { count: [2, 3], types: ['rest', 'shop', 'rest'] },
  // Row 4: Medium combat, 3 nodes
  { count: 3, types: ['combat'], difficulty: 'medium' },
  // Row 5: Combat / Elite, 3 nodes (one must be elite)
  {
    count: 3,
    types: (index, _count) => index === 1 ? 'elite' : 'combat',
    difficulty: 'medium',
  },
  // Row 6: Rest / Shop / Event, 2-3 nodes
  { count: [2, 3], types: ['rest', 'shop', 'event'] },
  // Row 7: Hard combat, 3 nodes
  { count: 3, types: ['combat'], difficulty: 'hard' },
  // Row 8: Combat / Elite, 3 nodes (one must be elite)
  {
    count: 3,
    types: (index, _count) => index === 1 ? 'elite' : 'combat',
    difficulty: 'hard',
  },
  // Row 9: Boss, 1 node
  { count: 1, types: ['boss'] },
]

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// === Map Generation ===

export function generateMap(): GameMap {
  const nodes: MapNode[] = []
  const rowNodes: MapNode[][] = []

  // Generate nodes for each row
  for (let row = 0; row < 10; row++) {
    const def = ROW_DEFS[row]
    const count = Array.isArray(def.count)
      ? def.count[0] + Math.floor(Math.random() * (def.count[1] - def.count[0] + 1))
      : def.count

    const rowNodeList: MapNode[] = []
    for (let col = 0; col < count; col++) {
      let type: MapNodeType
      if (typeof def.types === 'function') {
        type = def.types(col, count)
      } else if (def.types.length === 1) {
        type = def.types[0]
      } else {
        // Shuffle types and assign
        const shuffled = shuffleArray(def.types)
        type = shuffled[col % shuffled.length]
      }

      const difficulty = type === 'elite' ? undefined : def.difficulty
      let enemyNames: string[] | undefined
      if (type === 'combat' && difficulty) {
        enemyNames = pickEncounter(difficulty)
      } else if (type === 'elite') {
        enemyNames = pickRandom(ELITE_ENCOUNTERS)
      } else if (type === 'boss') {
        enemyNames = ['The Tide King']
      }

      const node: MapNode = {
        id: `node-${row}-${col}`,
        row,
        col,
        type,
        edges: [],
        visited: false,
        enemyNames,
        difficulty,
      }
      rowNodeList.push(node)
      nodes.push(node)
    }
    rowNodes.push(rowNodeList)
  }

  // Generate edges (connect each row to the next)
  for (let row = 0; row < 9; row++) {
    const current = rowNodes[row]
    const next = rowNodes[row + 1]

    if (next.length === 1) {
      // All nodes connect to single next node (boss)
      for (const node of current) {
        node.edges.push(next[0].id)
      }
      continue
    }

    // Ensure every node has at least 1 connection forward
    // and every next node has at least 1 connection backward
    // Use a non-crossing edge approach

    // Map column positions to proportional positions
    const curPositions = current.map((_, i) => i / Math.max(1, current.length - 1))
    const nextPositions = next.map((_, i) => i / Math.max(1, next.length - 1))

    // Each current node connects to the nearest next node
    for (let i = 0; i < current.length; i++) {
      const pos = curPositions[i]
      // Find closest next node
      let bestIdx = 0
      let bestDist = Infinity
      for (let j = 0; j < next.length; j++) {
        const dist = Math.abs(pos - nextPositions[j])
        if (dist < bestDist) {
          bestDist = dist
          bestIdx = j
        }
      }
      if (!current[i].edges.includes(next[bestIdx].id)) {
        current[i].edges.push(next[bestIdx].id)
      }

      // Sometimes add a second edge to an adjacent next node
      if (Math.random() < 0.4) {
        const adjIdx = bestIdx + (Math.random() < 0.5 ? -1 : 1)
        if (adjIdx >= 0 && adjIdx < next.length && !current[i].edges.includes(next[adjIdx].id)) {
          current[i].edges.push(next[adjIdx].id)
        }
      }
    }

    // Ensure every next node has at least one incoming edge
    for (let j = 0; j < next.length; j++) {
      const hasIncoming = current.some(n => n.edges.includes(next[j].id))
      if (!hasIncoming) {
        // Connect from the nearest current node
        let bestIdx = 0
        let bestDist = Infinity
        const nextPos = nextPositions[j]
        for (let i = 0; i < current.length; i++) {
          const dist = Math.abs(curPositions[i] - nextPos)
          if (dist < bestDist) {
            bestDist = dist
            bestIdx = i
          }
        }
        current[bestIdx].edges.push(next[j].id)
      }
    }
  }

  return { nodes, currentNodeId: null }
}

// === Map Queries ===

export function getStartingNodes(map: GameMap): MapNode[] {
  return map.nodes.filter(n => n.row === 0)
}

export function getAvailableNodes(map: GameMap): MapNode[] {
  if (!map.currentNodeId) {
    return getStartingNodes(map)
  }
  const current = map.nodes.find(n => n.id === map.currentNodeId)
  if (!current) return []
  return current.edges
    .map(id => map.nodes.find(n => n.id === id))
    .filter((n): n is MapNode => n !== undefined)
}

export function getNode(map: GameMap, nodeId: string): MapNode | undefined {
  return map.nodes.find(n => n.id === nodeId)
}

export function markNodeVisited(map: GameMap, nodeId: string): GameMap {
  return {
    ...map,
    currentNodeId: nodeId,
    nodes: map.nodes.map(n =>
      n.id === nodeId ? { ...n, visited: true } : n
    ),
  }
}

export function getSandDollarReward(difficulty: DifficultyTier | undefined, type: MapNodeType): number {
  if (type === 'boss') return 0
  if (type === 'elite') return 20
  switch (difficulty) {
    case 'easy': return 8 + Math.floor(Math.random() * 5) // 8-12
    case 'medium': return 10 + Math.floor(Math.random() * 5) // 10-14
    case 'hard': return 12 + Math.floor(Math.random() * 5) // 12-16
    default: return 10
  }
}
