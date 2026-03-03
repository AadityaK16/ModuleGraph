import type { EntityType, Predicate } from "./extraction";

export interface GraphNode {
  id: string;
  name: string;
  type: EntityType;
  color: string;
  icon: string;
  connections: number;
}

export interface GraphLink {
  source: string;
  target: string;
  predicate: Predicate;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
