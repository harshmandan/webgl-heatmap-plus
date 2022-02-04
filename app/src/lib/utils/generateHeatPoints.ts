// create a function that generates random (x, y) points for a screen layout
// the screen layout is a rectangle with a width and height
// the function should return an array of points
// the points should be evenly distributed across the screen

type Second = number;
type Point = { x: number; y: number };
export default function generateHeatPoints(duration: number) {
	const points: Record<Second, Point[]> = {};

	const width = window.innerWidth;
	const height = window.innerHeight;

	const numPoints = width * height;
	const step = Math.floor(numPoints / Math.min(60, duration));
	let i = 0;

	while (i < numPoints) {
		const x = Math.floor(Math.random() * width);
		const y = Math.floor(Math.random() * height);
		const randSec = Math.floor(Math.random() * duration);

		if (!points[randSec]) {
			points[randSec] = [];
		}
		points[randSec].push({ x, y });

		i += step;
	}

	return points;
}
