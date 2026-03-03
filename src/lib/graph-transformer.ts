import type { Entity, Triplet, EntityType } from "@/types/extraction";
import type { GraphData, GraphNode, GraphLink } from "@/types/graph";

const ENTITY_COLOR: Record<EntityType, string> = {
  concept: "#6366f1",
  topic: "#8b5cf6",
  skill: "#06b6d4",
  assignment: "#f59e0b",
  objective: "#10b981",
  prerequisite: "#ef4444",
};

const ENTITY_ICON: Record<EntityType, string> = {
  concept: "✱",
  topic: "◆",
  skill: "⚙",
  assignment: "✎",
  objective: "⚑",
  prerequisite: "⚠",
};

export function buildGraphFromExtraction(
  entities: Entity[],
  triplets: Triplet[]
): GraphData {
  const nodeMap = new Map<string, GraphNode>();

  // Create nodes from entities, deduplicate by name
  for (const entity of entities) {
    const key = entity.name.toLowerCase();
    if (!nodeMap.has(key)) {
      nodeMap.set(key, {
        id: key,
        name: entity.name,
        type: entity.type,
        color: ENTITY_COLOR[entity.type] ?? "#64748b",
        icon: ENTITY_ICON[entity.type] ?? "○",
        connections: 0,
      });
    }
  }

  // Create links from triplets, counting connections
  const links: GraphLink[] = [];
  for (const triplet of triplets) {
    const sourceKey = triplet.subject.toLowerCase();
    const targetKey = triplet.object.toLowerCase();

    // Only add link if both nodes exist
    if (nodeMap.has(sourceKey) && nodeMap.has(targetKey)) {
      links.push({
        source: sourceKey,
        target: targetKey,
        predicate: triplet.predicate,
      });
      nodeMap.get(sourceKey)!.connections++;
      nodeMap.get(targetKey)!.connections++;
    }
  }

  return { nodes: Array.from(nodeMap.values()), links };
}
