// create a function that generates random (x, y) points for a screen layout
// the screen layout is a rectangle with a width and height
// the function should return an array of points
// the points should be evenly distributed across the screen

type Second = number;
type Point = { x: number; y: number };
const BUFFER = 50;
export default function generateHeatPoints(duration: number, videoWidth = 0, videoHeight = 0) {
	const points: Record<Second, Point[]> = {};

	const width = videoWidth;
	const height = videoHeight;

	const numPoints = width * height;
	const step = Math.floor(numPoints / (duration + width));
	let i = 0;

	while (i < numPoints) {
		const x = Math.floor(Math.random() * width - BUFFER);
		const y = Math.floor(Math.random() * height - BUFFER);
		const randSec = Math.floor(Math.random() * duration);

		if (!points[randSec]) {
			points[randSec] = [];
		}
		points[randSec].push({ x, y });

		i += step;
	}

	return points;
}
