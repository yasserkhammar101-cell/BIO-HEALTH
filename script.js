/* ==========================================
   BIO HEALTH - Interactive 3D DNA Scene
   ========================================== */

// Scene Setup
let scene, camera, renderer, dnaGroup, particlesGroup;
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;
let scrollY = 0;
let clock;

// DNA Parameters
const DNA_RADIUS = 2;
const DNA_HEIGHT = 12;
const HELIX_TURNS = 4;
const POINTS_PER_TURN = 30;
const TOTAL_POINTS = HELIX_TURNS * POINTS_PER_TURN;

// Initialize Scene
function init() {
  const container = document.getElementById('dna-container');
  if (!container) return;

  // Create scene
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x020817, 10, 50);

  // Create camera
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 15;

  // Create renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x020817, 1);
  container.appendChild(renderer.domElement);

  // Create clock for animations
  clock = new THREE.Clock();

  // Create DNA
  createDNA();

  // Create floating particles
  createParticles();

  // Create orbiting atoms
  createOrbitingAtoms();

  // Create holographic data
  createHolographicData();

  // Add lights
  addLights();

  // Event listeners
  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('scroll', onScroll, false);

  // Start animation
  animate();
}

// Create DNA Double Helix
function createDNA() {
  dnaGroup = new THREE.Group();

  // Create two helixes
  const helix1Points = [];
  const helix2Points = [];
  
  for (let i = 0; i < TOTAL_POINTS; i++) {
    const t = i / TOTAL_POINTS;
    const angle = t * Math.PI * 2 * HELIX_TURNS;
    const y = (t - 0.5) * DNA_HEIGHT;
    
    // First helix
    const x1 = Math.cos(angle) * DNA_RADIUS;
    const z1 = Math.sin(angle) * DNA_RADIUS;
    helix1Points.push(new THREE.Vector3(x1, y, z1));
    
    // Second helix (180 degrees offset)
    const x2 = Math.cos(angle + Math.PI) * DNA_RADIUS;
    const z2 = Math.sin(angle + Math.PI) * DNA_RADIUS;
    helix2Points.push(new THREE.Vector3(x2, y, z2));
  }

  // Create glowing particles for helixes
  const particleMaterial = new THREE.PointsMaterial({
    color: 0x00D4FF,
    size: 0.15,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });

  const particleMaterial2 = new THREE.PointsMaterial({
    color: 0x0066CC,
    size: 0.15,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });

  // Convert points to geometry
  const geometry1 = new THREE.BufferGeometry().setFromPoints(helix1Points);
  const geometry2 = new THREE.BufferGeometry().setFromPoints(helix2Points);

  const particles1 = new THREE.Points(geometry1, particleMaterial);
  const particles2 = new THREE.Points(geometry2, particleMaterial2);

  dnaGroup.add(particles1);
  dnaGroup.add(particles2);

  // Create connecting bars (base pairs)
  const barMaterial = new THREE.LineBasicMaterial({
    color: 0x3399FF,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
  });

  for (let i = 0; i < TOTAL_POINTS; i += 3) {
    const barGeometry = new THREE.BufferGeometry().setFromPoints([
      helix1Points[i],
      helix2Points[i]
    ]);
    const bar = new THREE.Line(barGeometry, barMaterial);
    dnaGroup.add(bar);
  }

  // Create outer glow tube for first helix
  const curve1 = new THREE.CatmullRomCurve3(helix1Points);
  const tubeGeometry1 = new THREE.TubeGeometry(curve1, 200, 0.08, 8, false);
  const tubeMaterial1 = new THREE.MeshBasicMaterial({
    color: 0x00D4FF,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  });
  const tube1 = new THREE.Mesh(tubeGeometry1, tubeMaterial1);
  dnaGroup.add(tube1);

  // Create outer glow tube for second helix
  const curve2 = new THREE.CatmullRomCurve3(helix2Points);
  const tubeGeometry2 = new THREE.TubeGeometry(curve2, 200, 0.08, 8, false);
  const tubeMaterial2 = new THREE.MeshBasicMaterial({
    color: 0x0066CC,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  });
  const tube2 = new THREE.Mesh(tubeGeometry2, tubeMaterial2);
  dnaGroup.add(tube2);

  scene.add(dnaGroup);
}

// Create floating background particles
function createParticles() {
  particlesGroup = new THREE.Group();
  
  const particleCount = 500;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  const color1 = new THREE.Color(0x00D4FF);
  const color2 = new THREE.Color(0x0066CC);
  const color3 = new THREE.Color(0xFFFFFF);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Random position in a sphere
    const radius = 20 + Math.random() * 30;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    // Random color
    const colorChoice = Math.random();
    let color;
    if (colorChoice < 0.5) color = color1;
    else if (colorChoice < 0.8) color = color2;
    else color = color3;
    
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    // Random size
    sizes[i] = Math.random() * 0.1 + 0.02;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 0.08,
    transparent: true,
    opacity: 0.6,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  const particles = new THREE.Points(geometry, material);
  particlesGroup.add(particles);
  scene.add(particlesGroup);
}

// Create orbiting atoms/molecules
function createOrbitingAtoms() {
  const atomGroup = new THREE.Group();
  
  // Create multiple orbiting spheres
  const orbitRadii = [4, 5.5, 7];
  const atomColors = [0x00D4FF, 0x3399FF, 0x66E5FF];
  
  orbitRadii.forEach((radius, index) => {
    // Create orbit ring
    const ringGeometry = new THREE.RingGeometry(radius - 0.02, radius + 0.02, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: atomColors[index],
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2 + (index * 0.3);
    ring.rotation.y = index * 0.5;
    atomGroup.add(ring);

    // Create orbiting atom
    const atomGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const atomMaterial = new THREE.MeshBasicMaterial({
      color: atomColors[index],
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const atom = new THREE.Mesh(atomGeometry, atomMaterial);
    atom.userData = {
      orbitRadius: radius,
      orbitSpeed: 0.5 + index * 0.2,
      orbitOffset: index * (Math.PI * 2 / 3),
      tiltX: Math.PI / 2 + (index * 0.3),
      tiltY: index * 0.5
    };
    atomGroup.add(atom);
  });

  scene.add(atomGroup);
  
  // Store reference for animation
  scene.userData.atomGroup = atomGroup;
}

// Create holographic data elements
function createHolographicData() {
  const holoGroup = new THREE.Group();
  
  // Create floating data particles
  for (let i = 0; i < 20; i++) {
    const geometry = new THREE.BoxGeometry(0.1, 0.3, 0.02);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00D4FF,
      transparent: true,
      opacity: 0.4 + Math.random() * 0.3,
      blending: THREE.AdditiveBlending
    });
    const box = new THREE.Mesh(geometry, material);
    
    // Random position around DNA
    const angle = Math.random() * Math.PI * 2;
    const radius = 6 + Math.random() * 3;
    box.position.x = Math.cos(angle) * radius;
    box.position.y = (Math.random() - 0.5) * 10;
    box.position.z = Math.sin(angle) * radius;
    box.rotation.y = angle;
    
    box.userData = {
      baseY: box.position.y,
      floatSpeed: 0.5 + Math.random() * 0.5,
      floatOffset: Math.random() * Math.PI * 2
    };
    
    holoGroup.add(box);
  }

  scene.add(holoGroup);
  scene.userData.holoGroup = holoGroup;
}

// Add lights
function addLights() {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0x0066CC, 0.3);
  scene.add(ambientLight);

  // Point lights for glow effects
  const pointLight1 = new THREE.PointLight(0x00D4FF, 1.5, 30);
  pointLight1.position.set(5, 5, 5);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x0066CC, 1.5, 30);
  pointLight2.position.set(-5, -5, 5);
  scene.add(pointLight2);

  const pointLight3 = new THREE.PointLight(0x3399FF, 1, 20);
  pointLight3.position.set(0, 0, 10);
  scene.add(pointLight3);
}

// Mouse move handler
function onMouseMove(event) {
  targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
  targetMouseY = (event.clientY / window.innerHeight) * 2 - 1;
}

// Scroll handler
function onScroll() {
  scrollY = window.scrollY;
}

// Window resize handler
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  const time = clock.getElapsedTime();

  // Smooth mouse follow
  mouseX += (targetMouseX - mouseX) * 0.05;
  mouseY += (targetMouseY - mouseY) * 0.05;

  // Rotate DNA based on time and mouse
  if (dnaGroup) {
    dnaGroup.rotation.y = time * 0.3 + mouseX * 0.5;
    dnaGroup.rotation.x = mouseY * 0.2;
    
    // Zoom effect based on scroll
    const scrollFactor = Math.min(scrollY / 1000, 1);
    camera.position.z = 15 - scrollFactor * 5;
  }

  // Rotate particles
  if (particlesGroup) {
    particlesGroup.rotation.y = time * 0.05;
    particlesGroup.rotation.x = time * 0.02;
  }

  // Animate orbiting atoms
  if (scene.userData.atomGroup) {
    scene.userData.atomGroup.children.forEach((child) => {
      if (child.userData.orbitRadius) {
        const { orbitRadius, orbitSpeed, orbitOffset, tiltX, tiltY } = child.userData;
        const angle = time * orbitSpeed + orbitOffset;
        
        // Calculate position on tilted orbit
        child.position.x = Math.cos(angle) * orbitRadius;
        child.position.y = Math.sin(angle) * orbitRadius * Math.sin(tiltX);
        child.position.z = Math.sin(angle) * orbitRadius * Math.cos(tiltX);
      }
    });
  }

  // Animate holographic data
  if (scene.userData.holoGroup) {
    scene.userData.holoGroup.children.forEach((child) => {
      if (child.userData.baseY !== undefined) {
        const { baseY, floatSpeed, floatOffset } = child.userData;
        child.position.y = baseY + Math.sin(time * floatSpeed + floatOffset) * 0.5;
        child.material.opacity = 0.3 + Math.sin(time * 2 + floatOffset) * 0.2;
      }
    });
  }

  renderer.render(scene, camera);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

/* ==========================================
   UI INTERACTIONS
   ========================================== */

// Header scroll effect
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('nav');
  
  if (mobileMenuBtn && nav) {
    mobileMenuBtn.addEventListener('click', () => {
      nav.classList.toggle('active');
      mobileMenuBtn.classList.toggle('active');
    });
  }

  // Close mobile menu when clicking a link
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
      mobileMenuBtn.classList.remove('active');
    });
  });
});

// Scroll animations
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  // Add fade-in class to elements
  const animatedElements = document.querySelectorAll(
    '.partner-card, .product-card, .service-card, .blog-card, .info-card'
  );
  
  animatedElements.forEach((el, index) => {
    el.classList.add('fade-in');
    el.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(el);
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Contact form handling
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      // Simple validation
      if (!data.name || !data.email || !data.message) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
      }
      
      // Show success message (in production, you'd send this to a server)
      alert('Merci pour votre message! Nous vous contacterons bientôt.');
      form.reset();
    });
  }
});
