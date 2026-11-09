import { portfolioSceneGeometry } from './portfolio-board.js';

// Координаты в том же саду 1800×1200, что у гитары, фонарей и тропинки.
export const PROJECT_PROP = { x: 1000, y: 932, width: 168, height: 112 };
export const PROJECT_TIMING = { compress: 700, launch: 1250, blackout: 120, hold: 100, open: 1050, close: 820, return: 550 };

export function projectPropGeometry() {
  const { scene, scale } = portfolioSceneGeometry();
  return { x: scene.left + PROJECT_PROP.x * scale, y: scene.top + PROJECT_PROP.y * scale,
    width: PROJECT_PROP.width * scale, height: PROJECT_PROP.height * scale, scale };
}

export function projectCoverGeometry(width, height) {
  // Непрозрачная часть портфеля: x=4..236, y=26..151 в исходнике 240×160.
  const scale = Math.max(width / 232, height / 125) * 1.18;
  return { x: width / 2 - 120 * scale, y: height / 2 - 88.5 * scale, scale };
}

export const projectCaseTransform = ({ x, y, scale }) => `translate3d(${x}px, ${y}px, 0px) scale(${scale})`;

export function projectFlightPose(start, width, height, time) {
  const t = Math.max(0, Math.min(1, time));
  // Одна гладкая кривая: скорость и ускорение непрерывны, включая края.
  const progress = t * t * t * (10 + t * (-15 + 6 * t));
  const target = projectCoverGeometry(width, height);
  const scale = Math.exp(Math.log(start.scale) + Math.log(target.scale / start.scale) * progress);
  const centerX = start.x + 120 * start.scale;
  const centerY = start.y + 88.5 * start.scale;
  const arc = Math.min(48, height * .05) * Math.sin(Math.PI * progress);
  return { x: centerX + (width / 2 - centerX) * progress - 120 * scale,
    y: centerY + (height / 2 - centerY) * progress - arc - 88.5 * scale, scale };
}

export function projectFlightFrames(start, width, height) {
  return Array.from({ length: 97 }, (_, index) => {
    const t = index / 96;
    const fade = Math.min(1, t / .18);
    return { offset: t, transform: projectCaseTransform(projectFlightPose(start, width, height, t)),
      opacity: .8 + .2 * fade * fade * (3 - 2 * fade) };
  });
}
