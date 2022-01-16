export type SpecType = Record<string, any>;
export interface FloatExtensionProps {
	filterable: boolean;
	renderable: boolean;
	type: number | null;
	precision: string;
	score: number;
	texture?: boolean;
	half?: boolean;
	single?: boolean;
}