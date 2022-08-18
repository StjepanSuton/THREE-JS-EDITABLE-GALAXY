import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";

import * as dat from "dat.gui";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
const fog = new THREE.Fog("#262837", 10, 105);
scene.fog = fog;

const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load("/textures/particles/4.png");
/**
 * Test cube
 */

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 5;
scene.add(camera);

//GALAXY
const parametrs = {};
parametrs.count = 15000;
parametrs.size = 0.05;
parametrs.radius = 10;
parametrs.branches = 4;
parametrs.spin = 1;
parametrs.randomness = 0.2;
parametrs.randomnessPower = 5;
parametrs.insideColor = "#ff6030";
parametrs.outsideColor = "#1b3984";

const sunGeometry = new THREE.SphereGeometry(0.2, 32, 16);
const sunMaterial = new THREE.MeshBasicMaterial({
  color: parametrs.insideColor,
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {
  if (points !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }
  geometry = new THREE.BufferGeometry();
  material = new THREE.PointsMaterial({
    size: parametrs.size,
    sizeAttenuation: true,
    depthWrite: false,
    alphaMap: particleTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });
  points = new THREE.Points(geometry, material);
  scene.add(points);
  const positions = new Float32Array(parametrs.count * 3);
  const colors = new Float32Array(parametrs.count * 32);

  const colorInside = new THREE.Color(parametrs.insideColor);
  const colorOutside = new THREE.Color(parametrs.outsideColor);

  for (let i = 0; i < parametrs.count; i++) {
    const i3 = i * 3;
    const radius = Math.random() * parametrs.radius;
    const spinAngle = radius * parametrs.spin;
    const branchAngle =
      ((i % parametrs.branches) / parametrs.branches) * Math.PI * 2;

    const randomX =
      Math.pow(Math.random(), parametrs.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(Math.random(), parametrs.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomZ =
      Math.pow(Math.random(), parametrs.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY + 0;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    //COLOR
    const mixedCOlor = colorInside.clone();
    mixedCOlor.lerp(colorOutside, (radius / parametrs.radius) * 1.5);

    colors[i3] = mixedCOlor.r;
    colors[i3 + 1] = mixedCOlor.g;
    colors[i3 + 2] = mixedCOlor.b;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
};
generateGalaxy();

gui
  .add(parametrs, "count")
  .min(100)
  .max(20000)
  .step(50)
  .onFinishChange(generateGalaxy);
gui
  .add(parametrs, "size")
  .min(0.001)
  .max(0.2)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui
  .add(parametrs, "radius")
  .min(0.001)
  .max(20)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui
  .add(parametrs, "branches")
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(generateGalaxy);
gui
  .add(parametrs, "spin")
  .min(-5)
  .max(5)
  .step(0.1)
  .onFinishChange(generateGalaxy);
gui
  .add(parametrs, "randomness")
  .min(0)
  .max(2)
  .step(0.01)
  .onFinishChange(generateGalaxy);
gui
  .add(parametrs, "randomnessPower")
  .min(1)
  .max(10)
  .step(0.01)
  .onFinishChange(generateGalaxy);
gui
  .addColor(parametrs, "insideColor")

  .onFinishChange(generateGalaxy);
gui
  .addColor(parametrs, "outsideColor")

  .onFinishChange(generateGalaxy);
// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  points.rotation.y = -(elapsedTime * 0.15);
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
