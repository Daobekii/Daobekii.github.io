import * as THREE from "./three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/controls/OrbitControls.js";
import { GUI } from "lil-gui";

// Main Scene and Renderer ----------------------------------------------------------------------------------------------------------------------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#bg"),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(60);

const backgroundCanvas = new THREE.TextureLoader().load("./assets/images/beach.jpg");
scene.background = backgroundCanvas;
//----------------------------------------------------------------------------------------------------------------------------------------------
//Sphere Scene and Renderer
const sphereScene = new THREE.Scene();
const sphereCamera = new THREE.PerspectiveCamera(45, 1000 / 600, 0.1, 100);

const sphereRenderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#sphere"),
    antialias: true
});
sphereRenderer.setPixelRatio(2);
sphereRenderer.setSize(window.innerWidth, window.innerHeight);
//------------------------------------------------------------------------------------------------------------------------------------------------------------
//Glsl Scene and Renderer

const glslScene = new THREE.Scene();
const glslCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const glslRenderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#glsl"),
});

glslRenderer.setPixelRatio(window.devicePixelRatio);
glslRenderer.setSize(window.innerWidth, window.innerHeight);
glslCamera.position.setZ(12);
//--------------------------------------------------------------------------------------------------------------------------------------------------

const glslControls = new OrbitControls(glslCamera, glslRenderer.domElement);

const uniforms = {
    u_time: {type: "f", value: 0.0},
    u_mousePos: {type: "v2", value: [0.0, 0.0]}
}

const glslGeometry = new THREE.SphereGeometry(3, 64, 64);
const glslMaterial = new THREE.ShaderMaterial({
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent,
    wireframe: true,
    side: THREE.DoubleSide,
    uniforms
});
const glslMesh = new THREE.Mesh(glslGeometry, glslMaterial);
glslScene.add(glslMesh);

const guiContainer = document.getElementById('glsl-gui-container');
const gui = new GUI({ container: guiContainer });

gui.add(glslMesh.material, "wireframe");
const scaleFolder = gui.addFolder("Scaling");
scaleFolder.open();
scaleFolder.add(glslMesh.scale, "x", 0, 2).name("Width");
scaleFolder.add(glslMesh.scale, "y", 0, 2).name("Height");
console.log(glslMesh);
//gui.add(glslMesh.geometry.parameters, "heightSegments", 1, 30, 1).name("Height Segments");
//gui.add(glslMesh.geometry.parameters, "widthSegments", 1, 30, 1).name("Width Segments");

const sphere = new THREE.Mesh(new THREE.SphereGeometry(3, 64, 64), new THREE.MeshStandardMaterial({color: "#ffffff"}));
const sphereLight = new THREE.PointLight(0xffffff, 220, 100);
sphereLight.position.set(0, 10, 10);
sphereScene.add(sphereLight);
sphereScene.add(sphere);
sphereCamera.position.z = 12;
sphereScene.add(sphereCamera);

const sphereControls = new OrbitControls(sphereCamera, sphereRenderer.domElement);
sphereControls.enableDamping = true;
sphereControls.enablePan = false;
sphereControls.enableZoom = false;
sphereControls.autoRotate = false; //Standard

window.addEventListener('resize', () => {
    // Main scene resize
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    sphereCamera.aspect = 1000 / 600;
    sphereCamera.updateProjectionMatrix();
    sphereRenderer.setSize(window.innerWidth, window.innerHeight);
});

let mouseDown = false;
let rgb = [];
const sphereCanvas = document.getElementById('sphere');

window.addEventListener("mousedown", () => (mouseDown = true));
window.addEventListener("mouseup", () => (mouseDown = false));

window.addEventListener("mousemove", (e) => {
    uniforms.u_mousePos.value = [e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight];
    if(mouseDown){
        // Position des Canvas relativ zum Fenster
        const rect = sphereCanvas.getBoundingClientRect();
        
        // Relative Mausposition innerhalb des Canvas
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // RGB-Werte basierend auf der relativen Mausposition
        rgb = [
            Math.round((mouseX / rect.width) * 255),
            Math.round((mouseY / rect.height) * 255),
            150
        ];

        // Normalisiere die RGB-Werte für Three.js
        const normalizedColor = new THREE.Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
        
        // Verwende GSAP, um die Farbänderung sanft zu animieren
        gsap.to(sphere.material.color, {
            r: normalizedColor.r,
            g: normalizedColor.g,
            b: normalizedColor.b,
            duration: 0.5 // Dauer der Animation anpassen
        });
    }
});

function addStar(){
    const star = new THREE.Mesh(new THREE.SphereGeometry(0.125, 24, 24), new THREE.MeshBasicMaterial({color: 0xffffff}));
    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
    star.position.set(x,y,z);
    sphereScene.add(star);
}

Array(200).fill().forEach(addStar);

const clock = new THREE.Clock();

let slideIndex = 0;
const slides = document.querySelectorAll('.slide');
const nextBtn = document.querySelector('.next');
const prevBtn = document.querySelector('.prev');

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.style.display = i === index ? 'block' : 'none';
    });
}

nextBtn.addEventListener('click', () => {
    slideIndex = (slideIndex + 1) % slides.length;
    showSlide(slideIndex);
});

prevBtn.addEventListener('click', () => {
    slideIndex = (slideIndex - 1 + slides.length) % slides.length;
    showSlide(slideIndex);
});

showSlide(slideIndex); // Initial anzeigen

function animate() {
    requestAnimationFrame(animate);
    uniforms.u_time.value = clock.getElapsedTime();

    sphereControls.update();
    glslControls.update();

    renderer.render(scene, camera);
    sphereRenderer.render(sphereScene, sphereCamera);
    glslRenderer.render(glslScene, glslCamera);

}
animate();