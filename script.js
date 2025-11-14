// Initialize GSAP and ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Global variables
let scenes = {};
let renderers = {};
let cameras = {};
let meshes = {};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initLoadingScreen();
    initializeAll();
    setupAnimations();
    setupInteractivity();
    setupPortfolioExpandable();
});
// Portfolio Expandable Card Logic
function setupPortfolioExpandable() {
    document.querySelectorAll('.portfolio-item').forEach(card => {
        const overlay = card.querySelector('.portfolio-overlay');
        const closeBtn = card.querySelector('.portfolio-close');

        // Only attach expand behavior if this card actually has an overlay and a close button
        if (!overlay || !closeBtn) {
            return;
        }

        // Expande ao clicar no card (mas não se clicar em um link interno)
        card.addEventListener('click', function(e) {
            if (card.classList.contains('expanded')) return;
            // Evita expandir se clicar em link ou botão dentro do card
            if (e.target.closest('a, button, .portfolio-close, .portfolio-overlay')) return;
            card.classList.add('expanded');
            document.body.style.overflow = 'hidden';
        });
        // Fecha ao clicar no botão de fechar
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                card.classList.remove('expanded');
                document.body.style.overflow = '';
            });
        }
        // Fecha ao clicar fora do conteúdo expandido
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    card.classList.remove('expanded');
                    document.body.style.overflow = '';
                }
            });
        }
        // Acessibilidade: ESC fecha (per-card listener)
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && card.classList.contains('expanded')) {
                card.classList.remove('expanded');
                document.body.style.overflow = '';
            }
        });
    });
}

// Interactive tilt + drag for portfolio cards
function setupInteractiveCards() {
    const cards = document.querySelectorAll('.interactive-card');
    cards.forEach(card => {
        let rect, mouseX=0, mouseY=0, isPointerDown=false, startX=0, startY=0, offsetX=0, offsetY=0;

        function updateTransform() {
            const cx = rect.left + rect.width/2;
            const cy = rect.top + rect.height/2;
            const dx = (mouseX - cx) / rect.width;
            const dy = (mouseY - cy) / rect.height;
            const rotX = (dy * 12) * -1;
            const rotY = (dx * 12);
            const translateX = offsetX;
            const translateY = offsetY;
            card.style.transform = `perspective(1000px) translate3d(${translateX}px, ${translateY}px, 0px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        }

        function onMove(e) {
            mouseX = e.clientX || (e.touches && e.touches[0].clientX) || mouseX;
            mouseY = e.clientY || (e.touches && e.touches[0].clientY) || mouseY;
            updateTransform();
        }

        function onDown(e) {
            isPointerDown = true;
            rect = card.getBoundingClientRect();
            startX = e.clientX || (e.touches && e.touches[0].clientX);
            startY = e.clientY || (e.touches && e.touches[0].clientY);
            card.style.transition = 'transform 0s';
        }

        function onUp() {
            isPointerDown = false;
            offsetX = 0; offsetY = 0;
            card.style.transition = 'transform 0.6s cubic-bezier(.2,.8,.2,1)';
            card.style.transform = '';
        }

        function onDrag(e) {
            if (!isPointerDown) return;
            const cx = e.clientX || (e.touches && e.touches[0].clientX);
            const cy = e.clientY || (e.touches && e.touches[0].clientY);
            offsetX = (cx - startX) * 0.18;
            offsetY = (cy - startY) * 0.12;
            updateTransform();
        }

        card.addEventListener('mousemove', onMove);
        card.addEventListener('touchmove', onMove, {passive:true});
        card.addEventListener('pointerdown', onDown);
        window.addEventListener('pointerup', onUp);
        card.addEventListener('pointermove', onDrag);
        card.addEventListener('mouseleave', onUp);
    });
}

// Initialize interactive cards after DOM ready
document.addEventListener('DOMContentLoaded', () => {
    setupInteractiveCards();
    setupMediaModal();
});

// Media modal: open fullscreen preview for videos/images
function setupMediaModal() {
    const modal = document.getElementById('media-modal');
    const modalBody = document.getElementById('media-modal-body');
    const btnClose = document.getElementById('media-modal-close');

    function openMedia(src, type='video') {
        modalBody.innerHTML = '';
        if (type === 'video') {
            const v = document.createElement('video');
            v.src = src;
            v.controls = true;
            v.autoplay = true;
            v.playsInline = true;
            v.style.maxHeight = '90vh';
            modalBody.appendChild(v);
        } else {
            const img = document.createElement('img');
            img.src = src;
            modalBody.appendChild(img);
        }
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        modal.setAttribute('aria-hidden', 'false');
    }

    function closeMedia() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        modalBody.innerHTML = '';
        modal.setAttribute('aria-hidden', 'true');
    }

    // Attach click on any interactive-card video or img
    document.querySelectorAll('.interactive-card video, .interactive-card img').forEach(el => {
        el.addEventListener('click', function(e){
            e.stopPropagation();
            const src = this.getAttribute('src') || this.getAttribute('data-src') || this.currentSrc || this.src;
            if (!src) return;
            const isVideo = this.tagName.toLowerCase() === 'video';
            openMedia(src, isVideo ? 'video' : 'image');
        });
    });

    // close handlers
    btnClose.addEventListener('click', closeMedia);
    modal.addEventListener('click', (e)=>{ if (e.target === modal) closeMedia(); });
    document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeMedia(); });
}

// WhatsApp floating CTA behavior: open configured URL (backend can inject window.__WHATSAPP_URL)
function setupWhatsAppFloat() {
    const btn = document.getElementById('whatsapp-float');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        // priority: data attribute -> global var -> default (opens WhatsApp web)
        const dataUrl = btn.getAttribute('data-chat-url');
        const globalUrl = window.__WHATSAPP_URL;
        const url = (dataUrl && dataUrl.trim()) || (globalUrl && globalUrl.trim()) || 'https://wa.me/';

        // Open in new tab for safety
        window.open(url, '_blank');
    });
}

// init whatsapp float
document.addEventListener('DOMContentLoaded', () => {
    setupWhatsAppFloat();
});

// WhatsApp availability badge logic
function setupWhatsAppBadge() {
    const badge = document.getElementById('whatsapp-badge');
    if (!badge) return;

    const attrStart = badge.getAttribute('data-start');
    const attrEnd = badge.getAttribute('data-end');
    const attrText = badge.getAttribute('data-text') || 'Atendimento';

    // Allow backend injection via window.__WHATSAPP_AVAILABILITY = { start:9, end:18, text:'Atendimento: 9h–18h' }
    const globalCfg = window.__WHATSAPP_AVAILABILITY || {};
    const start = parseInt(globalCfg.start ?? attrStart ?? 9, 10);
    const end = parseInt(globalCfg.end ?? attrEnd ?? 18, 10);
    const text = globalCfg.text || attrText;

    badge.textContent = text;

    function update() {
        const now = new Date();
        const hour = now.getHours();
        // Show if within interval [start, end)
        if (start <= end) {
            if (hour >= start && hour < end) badge.style.display = 'block';
            else badge.style.display = 'none';
        } else {
            // Overnight schedule (e.g., start 22, end 6)
            if (hour >= start || hour < end) badge.style.display = 'block';
            else badge.style.display = 'none';
        }
    }

    update();
    // Re-check every minute
    setInterval(update, 60 * 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    setupWhatsAppBadge();
});

// Loading Screen Management
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    
    // Simulate loading time
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        
        // Remove loading screen from DOM after transition
        setTimeout(() => {
            loadingScreen.remove();
        }, 500);
    }, 2000);
}

// Particle Background System
function initParticleBackground() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    canvas.style.opacity = '0.3';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.2
        };
    }
    
    function initParticles() {
        particles = [];
        for (let i = 0; i < 50; i++) {
            particles.push(createParticle());
        }
    }
    
    function updateParticles() {
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        });
    }
    
    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(102, 126, 234, ${particle.opacity})`;
            ctx.fill();
        });
        
        // Draw connections
        particles.forEach((particle, i) => {
            particles.slice(i + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(otherParticle.x, otherParticle.y);
                    ctx.strokeStyle = `rgba(102, 126, 234, ${0.1 * (1 - distance / 100)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
        });
    }
    
    function animate() {
        updateParticles();
        drawParticles();
        requestAnimationFrame(animate);
    }
    
    resizeCanvas();
    initParticles();
    animate();
    
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });
}

// Custom Cursor Implementation
function initCustomCursor() {
    // Create custom cursor
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    // Create cursor trail
    const trailElements = [];
    for (let i = 0; i < 10; i++) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        document.body.appendChild(trail);
        trailElements.push({
            element: trail,
            x: 0,
            y: 0
        });
    }
    
    let mouseX = 0, mouseY = 0;
    
    // Update cursor position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursor.style.left = mouseX - 10 + 'px';
        cursor.style.top = mouseY - 10 + 'px';
    });
    
    // Cursor trail animation
    function updateTrail() {
        trailElements.forEach((trail, index) => {
            const delay = index * 0.05;
            trail.x += (mouseX - trail.x) * (0.3 - delay);
            trail.y += (mouseY - trail.y) * (0.3 - delay);
            
            trail.element.style.left = trail.x - 3 + 'px';
            trail.element.style.top = trail.y - 3 + 'px';
            trail.element.style.opacity = (1 - index * 0.1) * 0.7;
        });
        
        requestAnimationFrame(updateTrail);
    }
    updateTrail();
    
    // Hover effects
    const hoverElements = document.querySelectorAll('a, button, .service-card, .portfolio-item');
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
    });
}

// Initialize all 3D scenes and animations
function initializeAll() {
    initHeroScene();
    initAboutScene();
    // initTeamScene(); // Removido: não renderizar objetos 3D na equipe
    initServiceScenes();
    initPortfolioScenes();
    initContactScene();
}

// Hero Section 3D Scene
function initHeroScene() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Iluminação
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xff00ff, 1.5, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    const pointLight2 = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight2.position.set(-5, -5, 2);
    scene.add(pointLight2);

    // Grupo da rede neural
    const neuralGroup = new THREE.Group();

    // Parâmetros
    const PARTICLE_COUNT = 400;
    const SPHERE_RADIUS = 2.5;
    const CONNECTION_DISTANCE = 0.7;

    // Nós (partículas)
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = [];
    const particleVertices = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos((2 * Math.random()) - 1);
        const x = SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta);
        const y = SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta);
        const z = SPHERE_RADIUS * Math.cos(phi);
        positions.push(x, y, z);
        particleVertices.push(new THREE.Vector3(x, y, z));
    }
    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.03,
        transparent: true,
        opacity: 0.8
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    neuralGroup.add(particles);

    // Conexões (linhas)
    const linesGeometry = new THREE.BufferGeometry();
    const linePositions = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        for (let j = i + 1; j < PARTICLE_COUNT; j++) {
            const p1 = particleVertices[i];
            const p2 = particleVertices[j];
            const distance = p1.distanceTo(p2);
            if (distance < CONNECTION_DISTANCE) {
                linePositions.push(p1.x, p1.y, p1.z);
                linePositions.push(p2.x, p2.y, p2.z);
            }
        }
    }
    linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const linesMaterial = new THREE.LineBasicMaterial({
        color: 0xff00ff,
        transparent: true,
        opacity: 0.3
    });
    const lines = new THREE.LineSegments(linesGeometry, linesMaterial);
    neuralGroup.add(lines);

    scene.add(neuralGroup);
    camera.position.z = 5;

    // Responsividade
    function handleResize() {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }
    window.addEventListener('resize', handleResize);

    // Animação baseada no scroll
    let scrollY = window.scrollY;
    function handleScroll() {
        scrollY = window.scrollY;
    }
    window.addEventListener('scroll', handleScroll, { passive: true });

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        neuralGroup.rotation.y = elapsedTime * 0.1;
        const scrollRotation = scrollY * 0.001;
        neuralGroup.rotation.x = scrollRotation;
        pointLight.intensity = 1.5 + Math.sin(elapsedTime * 2) * 0.5;
        renderer.render(scene, camera);
    }
    animate();
}

// About Section 3D Scene
function initAboutScene() {
    const canvas = document.getElementById('about-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Create interconnected nodes
    const nodeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x667eea });
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x764ba2, transparent: true, opacity: 0.6 });
    
    const nodes = [];
    const lines = [];
    
    // Create nodes in a network pattern
    for (let i = 0; i < 12; i++) {
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
        const angle = (i / 12) * Math.PI * 2;
        const radius = 2 + Math.sin(i * 0.5) * 0.5;
        
        node.position.x = Math.cos(angle) * radius;
        node.position.y = Math.sin(angle) * radius;
        node.position.z = Math.sin(i * 0.3) * 0.5;
        
        nodes.push(node);
        scene.add(node);
    }
    
    // Create connections between nodes
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            if (Math.random() > 0.7) {
                const geometry = new THREE.BufferGeometry().setFromPoints([
                    nodes[i].position,
                    nodes[j].position
                ]);
                const line = new THREE.Line(geometry, lineMaterial);
                lines.push(line);
                scene.add(line);
            }
        }
    }
    
    camera.position.z = 6;
    
    scenes.about = scene;
    renderers.about = renderer;
    cameras.about = camera;
    meshes.about = { nodes, lines };
    
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotate the entire network
        scene.rotation.y += 0.005;
        scene.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
        
        renderer.render(scene, camera);
    }
    animate();
}

// Team Section 3D Scene
// Removido: não renderizar objetos 3D na equipe

// Service Scenes
function initServiceScenes() {
    const serviceCanvases = document.querySelectorAll('.service-canvas');
    
    serviceCanvases.forEach((canvas, index) => {
        const service = canvas.dataset.service;
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        let mesh;
        
        if (service === 'web') {
            // Web development - Cube with grid pattern
            const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
            const material = new THREE.MeshBasicMaterial({ 
                color: 0x667eea, 
                wireframe: true,
                transparent: true,
                opacity: 0.8
            });
            mesh = new THREE.Mesh(geometry, material);
        } else if (service === 'ai') {
            // AI Design - Brain-like structure
            const geometry = new THREE.SphereGeometry(1, 16, 16);
            const material = new THREE.MeshBasicMaterial({ 
                color: 0x764ba2, 
                wireframe: true,
                transparent: true,
                opacity: 0.7
            });
            mesh = new THREE.Mesh(geometry, material);
        } else if (service === '3d') {
            // 3D Experiences - Complex polyhedron
            const geometry = new THREE.DodecahedronGeometry(1);
            const material = new THREE.MeshBasicMaterial({ 
                color: 0x667eea, 
                wireframe: true,
                transparent: true,
                opacity: 0.9
            });
            mesh = new THREE.Mesh(geometry, material);
        }
        
        scene.add(mesh);
        camera.position.z = 3;
        
        scenes[`service-${service}`] = scene;
        renderers[`service-${service}`] = renderer;
        cameras[`service-${service}`] = camera;
        meshes[`service-${service}`] = mesh;
        
        function animate() {
            requestAnimationFrame(animate);
            
            mesh.rotation.x += 0.01;
            mesh.rotation.y += 0.01;
            
            renderer.render(scene, camera);
        }
        animate();
    });
}

// Portfolio Scenes
function initPortfolioScenes() {
    const portfolioCanvases = document.querySelectorAll('.portfolio-canvas');
    
    portfolioCanvases.forEach((canvas, index) => {
        const project = canvas.dataset.project;
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Modelos inspirados em logos Apple, Google, Intel
        let geometry, material, mesh;
        if (project === '1') {
            // Apple: esfera prata
            geometry = new THREE.SphereGeometry(1, 32, 32);
            material = new THREE.MeshBasicMaterial({ color: 0xcccccc, wireframe: false, transparent: true, opacity: 0.85 });
        } else if (project === '2') {
            // Google: torus colorido
            geometry = new THREE.TorusGeometry(1, 0.32, 24, 100);
            material = new THREE.MeshBasicMaterial({ color: 0x4285F4, wireframe: false });
            // Adiciona faixas coloridas (simples)
            let ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.32, 24, 100, Math.PI/2), new THREE.MeshBasicMaterial({ color: 0xEA4335 }));
            scene.add(ring);
            let ring2 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.32, 24, 100, Math.PI/2), new THREE.MeshBasicMaterial({ color: 0xFBBC05 }));
            ring2.rotation.z = Math.PI/2;
            scene.add(ring2);
        } else {
            // Intel: cubo azul
            geometry = new THREE.BoxGeometry(1.4, 1.4, 1.4);
            material = new THREE.MeshBasicMaterial({ color: 0x0071C5, wireframe: false, transparent: true, opacity: 0.9 });
        }
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        camera.position.z = 4;
        
        scenes[`portfolio-${project}`] = scene;
        renderers[`portfolio-${project}`] = renderer;
        cameras[`portfolio-${project}`] = camera;
        meshes[`portfolio-${project}`] = mesh;
        
        function animate() {
            requestAnimationFrame(animate);
            
            mesh.rotation.x += 0.008;
            mesh.rotation.y += 0.012;
            
            renderer.render(scene, camera);
        }
        animate();
    });
}

// Contact Scene
function initContactScene() {
    const canvas = document.getElementById('contact-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Create floating particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 10;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x667eea,
        size: 0.05,
        transparent: true,
        opacity: 0.6
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    
    camera.position.z = 5;
    
    scenes.contact = scene;
    renderers.contact = renderer;
    cameras.contact = camera;
    meshes.contact = particles;
    
    function animate() {
        requestAnimationFrame(animate);
        
        particles.rotation.y += 0.002;
        
        // Animate particles
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(Date.now() * 0.001 + positions[i]) * 0.001;
        }
        particles.geometry.attributes.position.needsUpdate = true;
        
        renderer.render(scene, camera);
    }
    animate();
}

// Setup GSAP Animations
function setupAnimations() {
    // Hero section animations
    gsap.from('.hero-title .title-line', {
        duration: 1,
        y: 100,
        opacity: 0,
        stagger: 0.2,
        ease: 'power3.out'
    });
    
    gsap.from('.hero-description', {
        duration: 1,
        y: 50,
        opacity: 0,
        delay: 0.8,
        ease: 'power3.out'
    });
    
    gsap.from('.hero-buttons', {
        duration: 1,
        y: 50,
        opacity: 0,
        delay: 1,
        ease: 'power3.out'
    });
    
    // Section animations with ScrollTrigger
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
            duration: 1,
            y: 50,
            opacity: 0,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: title,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            }
        });
    });
    
    gsap.utils.toArray('.section-description').forEach(desc => {
        gsap.from(desc, {
            duration: 1,
            y: 30,
            opacity: 0,
            delay: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: desc,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            }
        });
    });
    
    // Enhanced stats animation with counter effect
    gsap.utils.toArray('.stat-item').forEach((stat, index) => {
        const numberElement = stat.querySelector('h3');
        const finalNumber = numberElement.textContent;
        
        // Set initial number to 0
        numberElement.textContent = '0';
        
        gsap.from(stat, {
            duration: 1.2,
            y: 60,
            opacity: 0,
            scale: 0.8,
            delay: index * 0.15,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: stat,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse',
                onEnter: () => {
                    // Animate number counting
                    const isPercentage = finalNumber.includes('%');
                    const targetValue = parseInt(finalNumber.replace(/[^0-9]/g, ''));
                    
                    gsap.to({ value: 0 }, {
                        duration: 2,
                        value: targetValue,
                        delay: 0.5,
                        ease: 'power2.out',
                        onUpdate: function() {
                            const currentValue = Math.round(this.targets()[0].value);
                            numberElement.textContent = isPercentage ? currentValue + '%' : 
                                                      currentValue === 50 ? '50+' :
                                                      currentValue === 5 ? '5+' : currentValue;
                        }
                    });
                }
            }
        });
    });
    
    // Service cards animation with enhanced effects
    gsap.utils.toArray('.service-card').forEach((card, index) => {
        // Initial animation
        gsap.from(card, {
            duration: 1.2,
            y: 100,
            opacity: 0,
            scale: 0.8,
            rotation: 5,
            delay: index * 0.15,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            }
        });
        
        // Hover effects
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                duration: 0.3,
                scale: 1.05,
                y: -10,
                ease: 'power2.out'
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                duration: 0.3,
                scale: 1,
                y: 0,
                ease: 'power2.out'
            });
        });
    });

    // Mockup float effect
    gsap.to('.hero-mockup', {
        y: -10,
        rotate: -2,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
    });

    // CTA button micro animation
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
        btn.addEventListener('mouseenter', () => gsap.to(btn, { scale: 1.03, duration: 0.12 }));
        btn.addEventListener('mouseleave', () => gsap.to(btn, { scale: 1, duration: 0.12 }));
    });

    // Testimonials entrance
    gsap.utils.toArray('.testimonial').forEach((t, i) => {
        gsap.from(t, {
            duration: 0.9,
            y: 20,
            opacity: 0,
            delay: 0.3 + i * 0.12,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: t,
                start: 'top 85%'
            }
        });
    });
    
    // Portfolio items animation with enhanced effects
    gsap.utils.toArray('.portfolio-item').forEach((item, index) => {
        // Initial animation
        gsap.from(item, {
            duration: 1.3,
            y: 120,
            opacity: 0,
            scale: 0.7,
            rotationY: 15,
            delay: index * 0.12,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: item,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            }
        });
        
        // Hover effects
        item.addEventListener('mouseenter', () => {
            gsap.to(item, {
                duration: 0.4,
                scale: 1.08,
                y: -15,
                rotationY: 5,
                ease: 'power2.out'
            });
        });
        
        item.addEventListener('mouseleave', () => {
            gsap.to(item, {
                duration: 0.4,
                scale: 1,
                y: 0,
                rotationY: 0,
                ease: 'power2.out'
            });
        });
    });
    
    // Team section animations
    gsap.fromTo('.team-section .section-title', 
        { opacity: 0, y: 30 },
        { 
            opacity: 1, 
            y: 0, 
            duration: 0.8,
            scrollTrigger: {
                trigger: '.team-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        }
    );
    
    gsap.fromTo('.team-section .section-subtitle', 
        { opacity: 0, y: 20 },
        { 
            opacity: 1, 
            y: 0, 
            duration: 0.8,
            delay: 0.2,
            scrollTrigger: {
                trigger: '.team-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        }
    );
    
    // Team members animation
    gsap.fromTo('.team-member', 
        { 
            opacity: 0, 
            y: 80, 
            scale: 0.9,
            rotationY: 10
        },
        { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            rotationY: 0,
            duration: 1.2,
            stagger: 0.3,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.team-grid',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        }
    );
    
    // Team member hover effects
    document.querySelectorAll('.team-member').forEach(member => {
        member.addEventListener('mouseenter', () => {
            gsap.to(member, {
                scale: 1.02,
                y: -5,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        member.addEventListener('mouseleave', () => {
            gsap.to(member, {
                scale: 1,
                y: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });
    
    // Contact form animation
    gsap.from('.contact-form', {
        duration: 1,
        x: 50,
        opacity: 0,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.contact-form',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
        }
    });
    
    // 3D objects scroll-based animations
    if (meshes.hero) {
        ScrollTrigger.create({
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
            onUpdate: self => {
                const progress = self.progress;
                meshes.hero.forEach((mesh, index) => {
                    mesh.rotation.y = progress * Math.PI * 2 * (index + 1);
                    mesh.position.y = Math.sin(progress * Math.PI) * 0.5;
                });
            }
        });
    }
    
    if (meshes.about && meshes.about.nodes) {
        ScrollTrigger.create({
            trigger: '.about',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1,
            onUpdate: self => {
                const progress = self.progress;
                scenes.about.rotation.z = progress * Math.PI * 0.5;
            }
        });
    }
}

// Setup Interactivity
function setupInteractivity() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            // If the link points to the hero (Início) or the target is missing, scroll to absolute top
            const href = this.getAttribute('href');
            const target = document.querySelector(href);

            if (href === '#hero' || !target) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                // close mobile menu if open
                const hamburger = document.querySelector('.hamburger');
                const navMenu = document.querySelector('.nav-menu');
                if (hamburger && navMenu) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                }
                return;
            }

            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
    
    // Contact form handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Simulate form submission
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                submitBtn.textContent = 'Mensagem Enviada!';
                submitBtn.style.background = '#4CAF50';
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    this.reset();
                }, 2000);
            }, 1500);
        });
    }
    
    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
    
    // Enhanced mouse movement effect for 3D objects
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
        targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Smooth mouse following animation
    function updateMouseEffects() {
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;
        
        // Apply enhanced rotation to hero objects
        if (meshes.hero) {
            meshes.hero.forEach((mesh, index) => {
                const intensity = 0.3 + index * 0.1;
                mesh.rotation.x += (mouseY * intensity - mesh.rotation.x) * 0.02;
                mesh.rotation.y += (mouseX * intensity - mesh.rotation.y) * 0.02;
                
                // Add subtle position offset based on mouse
                mesh.position.x += (mouseX * 0.1 - mesh.position.x) * 0.01;
                mesh.position.y += (mouseY * 0.1 - mesh.position.y) * 0.01;
            });
        }
        
        // Apply mouse effects to service objects
        Object.keys(meshes).forEach(key => {
            if (key.startsWith('service-') && meshes[key]) {
                const mesh = meshes[key];
                mesh.rotation.x += (mouseY * 0.2 - mesh.rotation.x) * 0.01;
                mesh.rotation.y += (mouseX * 0.2 - mesh.rotation.y) * 0.01;
            }
        });
        
        requestAnimationFrame(updateMouseEffects);
    }
    updateMouseEffects();
}

// Handle window resize
window.addEventListener('resize', () => {
    Object.keys(renderers).forEach(key => {
        const renderer = renderers[key];
        const camera = cameras[key];
        const canvas = renderer.domElement;
        
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(10, 10, 10, 0.98)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
    }
});