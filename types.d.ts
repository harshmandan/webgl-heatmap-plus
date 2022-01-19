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
export interface HeatPoint {
	x: number;
	y: number;
	size: number | null;
	intensity: number | null;
}
