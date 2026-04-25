import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEFAULT_MODULES = [
  { name: 'Terra Brew', slug: 'metrang-coffee', description: 'Coffee Traceability & Quality Management', icon: 'Coffee', color: 'amber' },
  { name: 'Terra Bean', slug: 'terra-bean', description: 'Cocoa & Bean Processing', icon: 'Bean', color: 'orange' },
  { name: 'Terra Nexus', slug: 'terra-nexus', description: 'Staple Crop Management', icon: 'Wheat', color: 'yellow' },
  { name: 'Terra Blue', slug: 'terra-blue', description: 'Aquaculture & Fisheries', icon: 'Fish', color: 'cyan' },
  { name: 'Terra Veggies', slug: 'terra-veggies', description: 'Vegetable & Greens Farming', icon: 'Carrot', color: 'green' },
  { name: 'Terra Graze', slug: 'terra-graze', description: 'Livestock & Animal Husbandry', icon: 'Apple', color: 'red' },
  { name: 'Terra Orchard', slug: 'terra-orchard', description: 'Fruit Orchard Management', icon: 'TreePine', color: 'emerald' },
  { name: 'Terra Flora', slug: 'terra-flora', description: 'Floriculture & Flowers', icon: 'Flower2', color: 'pink' },
  { name: 'Terra Forest', slug: 'terra-forest', description: 'Agroforestry & Forest Management', icon: 'Trees', color: 'lime' },
  { name: 'Terra Mangrove', slug: 'terra-mangrove', description: 'Mangrove Conservation', icon: 'Waves', color: 'teal' },
  { name: 'Terra Silvi', slug: 'terra-silvi', description: 'Timber Legality Tracking', icon: 'Mountain', color: 'stone' },
  { name: 'Terra Spices', slug: 'terra-spices', description: 'Spice Quality & Certification', icon: 'Leaf', color: 'rose' },
]

export async function GET() {
  // Auto-seed modules if none exist
  const count = await db.module.count()
  if (count === 0) {
    for (const mod of DEFAULT_MODULES) {
      await db.module.create({ data: mod })
    }
  }

  const modules = await db.module.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(modules)
}
