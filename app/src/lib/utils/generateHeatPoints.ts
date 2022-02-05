type Second = number;
type Point = { x: number; y: number };

const areaOfEllipse = (width: number, height: number) => (Math.PI * width * height) / 4;
const getRandomPointY = (area: number, width: number) => Math.random() * (area / (Math.PI * width));

/**
 * generates random (x, y) points for a video layout
 * - layout is a rectangle of video width X height
 * - function should return an array of points
 * - points should be evenly distributed within an elliptical shape
 * - ellipse should be centered on the screen
 */
const generateHeatPoints = (duration: number, videoWidth = 0, videoHeight = 0) => {
	const points: Record<Second, Point[]> = {};

	const width = videoWidth;
	const height = videoHeight;

	const numPoints = width * height;
	const step = Math.floor(numPoints / (duration + width));
	let i = 0;

	const shortestDim = Math.min(width, height);
	const newWidth = Math.floor(shortestDim + (width - shortestDim) / 2);
	const newHeight = Math.floor(shortestDim + (height - shortestDim) / 2);
	const videoEllipse = areaOfEllipse(newWidth, newHeight);

	while (i < numPoints) {
		const x = Math.floor(Math.random() * newWidth);
		const y = getRandomPointY(videoEllipse, x);
		const randSec = Math.floor(Math.random() * duration);

		if (!points[randSec]) {
			points[randSec] = [];
		}
		points[randSec].push({ x, y });

		i += step;
	}

	return points;
};

export default generateHeatPoints;
