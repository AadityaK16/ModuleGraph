export type EntityType =
  | "concept"
  | "topic"
  | "skill"
  | "assignment"
  | "objective"
  | "prerequisite";

export interface Entity {
  name: string;
  type: EntityType;
}

export type Predicate =
  | "requires"
  | "covers"
  | "assesses"
  | "builds_on"
  | "develops"
  | "part_of"
  | "precedes"
  | "relates_to";

export interface Triplet {
  subject: string;
  predicate: Predicate;
  object: string;
}

export interface ExtractionRequest {
  syllabusText: string;
  moduleItems: { name: string; type: string; items: { title: string; type: string }[] }[];
  assignments: { name: string; description: string; due_at: string | null; points_possible: number | null }[];
}

export interface ExtractionResponse {
  entities: Entity[];
  triplets: Triplet[];
}
