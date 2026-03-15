const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth / 400,
0.1,
1000
);

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth,400);

document.getElementById("container").appendChild(renderer.domElement);

camera.position.z = 5;

const geometry = new THREE.BoxGeometry(2,1,1);

const material = new THREE.MeshBasicMaterial({color:0x1e6ed8});

const cube = new THREE.Mesh(geometry,material);

scene.add(cube);

function animate(){

requestAnimationFrame(animate);

cube.rotation.y += 0.01;

renderer.render(scene,camera);

}

animate();
