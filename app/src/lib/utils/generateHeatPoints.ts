type Second = number;
type Point = { x: number; y: number };

/**
 * generates random (x, y) points for a video layout
 * - layout is a rectangle of video width X height
 * - function should return an object
 * - object should have the shape Record<Second, Point[]>
 * - where key Second is a random seconds generated from duration,
 * - and values Point[] am array of random points
 * - points should be evenly distributed within an elliptical shape
 * - ellipse should be centered on the screen
 */
const generateHeatPoints = (duration: number, videoWidth = 0, videoHeight = 0) => {
	const width = Math.min(videoWidth || window.innerWidth);
	const height = Math.min(videoHeight || window.innerHeight);
	const center = {
		x: width / 2,
		y: height / 2
	};

	const points: Record<Second, Point[]> = {};
	const numPoints = Math.floor(Math.PI ** 2 * duration);
	const radius = Math.min(center.x, center.y);
	const angleStep = (2 * Math.PI) / numPoints;

	for (let i = 0; i < numPoints; i++) {
		const angle = i * angleStep;
		const x = center.x + radius * Math.cos(angle);
		const y = center.y + radius * Math.sin(angle);

		const randSec = Math.floor(Math.random() * duration);

		if (!points[randSec]) {
			points[randSec] = [];
		}
		points[randSec].push({ x, y });
	}

	return points;
};

export default generateHeatPoints;
