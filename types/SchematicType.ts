export interface SchematicType {
  id: number;
  schematicName: string;
  schematicFile: string; // URL PDF
  schematicImages: string[]; // mảng URL ảnh
  description: string;
  createdAt: string; // ISO date string
}
