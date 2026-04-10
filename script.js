// Typing Effect for Roles
const roles = [
    "Automation Engineer",
    "RPA Bot Developer",
    "Python Developer",
    "AI Enthusiast"
];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 100;

function typeWriter() {
    const typewriterElement = document.getElementById("typewriter");
    const currentRole = roles[roleIndex];

    if (isDeleting) {
        typewriterElement.innerHTML = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50; // Faster when deleting
    } else {
        typewriterElement.innerHTML = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 150; // Slower when typing
    }

    // If word is complete
    if (!isDeleting && charIndex === currentRole.length) {
        isDeleting = true;
        typeSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typeSpeed = 500; // Pause before new word
    }

    setTimeout(typeWriter, typeSpeed);
}

// Scroll Reveal Animation
function reveal() {
    const reveals = document.querySelectorAll(".reveal");

    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}

// Glitch Effect logic on Title Hover (Optional Custom JS logic if CSS is not enough)
const glitchTitle = document.querySelector('.glitch-title');
if (glitchTitle) {
    glitchTitle.addEventListener('mouseover', () => {
        glitchTitle.style.textShadow = `
            ${Math.random() * 10}px ${Math.random() * 10}px 0 rgba(0, 240, 255, 0.8),
            -${Math.random() * 10}px -${Math.random() * 10}px 0 rgba(255, 0, 85, 0.8)
        `;
    });
    glitchTitle.addEventListener('mouseout', () => {
        glitchTitle.style.textShadow = '0 0 15px rgba(0, 240, 255, 0.3)';
    });
}

// Initialize on Load
document.addEventListener("DOMContentLoaded", () => {
    typeWriter();
    window.addEventListener("scroll", reveal);

    // Trigger reveal once on load to show elements already in view
    reveal();
});

/* --- Immersive 3D Integrations --- */

// 1. Vanilla-Tilt Initialization
if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll(".cyber-card, .skill-category, .project-card, .extra-card"), {
        max: 15,
        speed: 400,
        glare: true,
        "max-glare": 0.2,
    });
}

// 2. Three.js Particle System & Core (Background)
if (typeof THREE !== 'undefined') {
    const canvas = document.getElementById('webgl-canvas');
    if (canvas) {
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            initMobile3D(canvas);
        } else {
            initDesktop3D(canvas);
        }
    }
}

function initDesktop3D(canvas) {
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 250;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- Evolving Particle Transformation Logic ---
    const particlesCount = 4000;
    const geometry = new THREE.BufferGeometry();

    const positionsTraditional = new Float32Array(particlesCount * 3);
    const positionsDigital = new Float32Array(particlesCount * 3);
    const currentPositions = new Float32Array(particlesCount * 3);

    // Build Transformation Coordinates
    const gridSize = Math.ceil(Math.sqrt(particlesCount));
    let i = 0;
    let index3 = 0;

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            if (index3 >= particlesCount * 3) break;

            // 1. Traditional Shape: Rigid, Flat 2D Grid (Spreadsheet / Manual Block)
            positionsTraditional[index3] = (x - gridSize / 2) * 8; // X
            positionsTraditional[index3 + 1] = (y - gridSize / 2) * 8; // Y
            positionsTraditional[index3 + 2] = (Math.random() * 5) - 2.5; // Z (nearly flat)

            // 2. Digital Shape: Complex 3D Globe / AI Topology
            const phi = Math.acos(- 1 + (2 * i) / particlesCount);
            const theta = Math.sqrt(particlesCount * Math.PI) * phi;

            // Radius of digital globe
            const r = 200 + Math.random() * 30;
            positionsDigital[index3] = r * Math.cos(theta) * Math.sin(phi);
            positionsDigital[index3 + 1] = r * Math.sin(theta) * Math.sin(phi);
            positionsDigital[index3 + 2] = r * Math.cos(phi);

            // Initial State
            currentPositions[index3] = positionsTraditional[index3];
            currentPositions[index3 + 1] = positionsTraditional[index3 + 1];
            currentPositions[index3 + 2] = positionsTraditional[index3 + 2];

            index3 += 3;
            i++;
        }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));

    const material = new THREE.PointsMaterial({
        size: 2.5,
        color: 0x888888, // Starts grey
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = event.clientX / window.innerWidth - 0.5;
        mouseY = event.clientY / window.innerHeight - 0.5;
    });

    // Scroll interaction
    let scrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    // Animation Loop
    const clock = new THREE.Clock();

    function tick() {
        const elapsedTime = clock.getElapsedTime();

        // Calculate Morph Factor (0 to 1) oscillating slowly
        // 0 = Traditional Grid, 1 = Evolved Digital Sphere
        let morphFactor = (Math.sin(elapsedTime * 0.4) + 1) / 2;

        // Easing the morph factor to sit at extremes longer
        morphFactor = Math.pow(morphFactor, 1.5);

        // Interpolate Particle Positions
        const currentPosList = particlesMesh.geometry.attributes.position.array;
        for (let j = 0; j < particlesCount * 3; j++) {
            const start = positionsTraditional[j];
            const end = positionsDigital[j];
            // Smooth Lerp
            currentPosList[j] = start + (end - start) * morphFactor;
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        // Dynamic Color based on Evolution State
        // Closer to 0: Dull Grey, Closer to 1: Neon Cyan (0x00f0ff)
        const r = 0x88 + (0x00 - 0x88) * morphFactor;
        const g = 0x88 + (0xf0 - 0x88) * morphFactor;
        const b = 0x88 + (0xff - 0x88) * morphFactor;
        material.color.setRGB(r / 255, g / 255, b / 255);

        // Dynamic Rotation based on Evolution State
        // Speed reduced but still dynamic based on form
        particlesMesh.rotation.y = elapsedTime * (0.02 + morphFactor * 0.04) + mouseX * 0.6;
        particlesMesh.rotation.x = mouseY * 0.6;

        // Camera Zoom & Pan on scroll
        camera.position.z = 300 - (scrollY * 0.08); // Starts slightly further back to see full grid
        camera.position.y = -(scrollY * 0.02);

        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    }
    tick();

    // Handle Resize
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            location.reload(); // Auto switch to mobile if scaled down
        } else {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
    });
}

function initMobile3D(canvas) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 8000);

    // Start at the front of the tunnel
    camera.position.z = 1500;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particlesCount = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Radius between 60 and 200 to form a thick tube
        const radius = 60 + Math.random() * 140;

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        // Deep Z spread for the tunnel (-4000 to 4000 = 8000 depth)
        const z = (Math.random() - 0.5) * 8000;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        size: 3.5,
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);

    let scrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    const clock = new THREE.Clock();

    function tick() {
        const elapsedTime = clock.getElapsedTime();

        // Slowly rotate the tunnel around Z axis
        particlesMesh.rotation.z = elapsedTime * 0.15;

        // Oscillate color between cyan and magenta
        const morphFactor = (Math.sin(elapsedTime * 0.6) + 1) / 2;
        const r = 0x00 + (0xff - 0x00) * morphFactor;
        const g = 0xf0 + (0x00 - 0xf0) * morphFactor;
        const b = 0xff - (0xaa * morphFactor);
        material.color.setRGB(r / 255, g / 255, b / 255);

        // Core mechanic: Move through the tunnel based on scroll
        // Multiplier controls how fast you fly based on scroll pixel
        camera.position.z = 1500 - (scrollY * 1.5);

        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    }
    tick();

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            location.reload(); // Auto switch to desktop if scaled up
        } else {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
    });
}

// --- Resume Download functionality ---
function triggerResumeDownload() {
    if (typeof html2pdf === 'undefined') {
        alert("PDF Library is not loaded yet. Please try again in a moment.");
        return;
    }

    const btn = document.getElementById('downloadResumeBtn');
    if (!btn || btn.classList.contains('is-downloading')) return;

    btn.classList.add('is-downloading');
    
    // To prevent html2canvas from cropping the image when the original is off-screen or on mobile,
    // we clone the element and place it at the top-left of the document behind the background.
    const originalElement = document.getElementById('resume-container');
    
    const cloneWrapper = document.createElement('div');
    cloneWrapper.style.position = 'absolute';
    cloneWrapper.style.top = '0';
    cloneWrapper.style.left = '0';
    cloneWrapper.style.zIndex = '-9999';
    cloneWrapper.style.background = '#ffffff';
    cloneWrapper.style.width = '210mm';
    cloneWrapper.style.minHeight = '297mm';
    
    const cloneElement = originalElement.cloneNode(true);
    // Ensure the clone has no display/visibility restrictions
    cloneElement.style.display = 'block';
    cloneElement.style.visibility = 'visible';
    
    cloneWrapper.appendChild(cloneElement);
    document.body.appendChild(cloneWrapper);

    const opt = {
        margin:       0,
        filename:     'Vishvajit_Surwase_Resume.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false, windowWidth: 794 }, // 794px is roughly A4 width
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(cloneElement).set(opt).save().then(() => {
        document.body.removeChild(cloneWrapper);
        btn.classList.remove('is-downloading');
    }).catch(err => {
        console.error("Resume download error:", err);
        if (document.body.contains(cloneWrapper)) {
            document.body.removeChild(cloneWrapper);
        }
        btn.classList.remove('is-downloading');
        alert("An error occurred while generating the resume. Please try again.");
    });
}
