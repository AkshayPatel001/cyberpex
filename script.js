document.addEventListener('DOMContentLoaded', () => {
    // 1. Particle Canvas Effect (Massive Random Field)
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let particles = [];
    
    // Mouse tracking
    let mouseX = -1000; // start off-screen
    let mouseY = -1000;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const azureColors = ['#0078d4', '#2b88d8', '#005a9e', '#f8f9fa', '#ffffff', '#e1dfdd'];

    // Create random floating particles
    function initParticles() {
        particles = [];
        const numParticles = Math.floor((width * height) / 2700); // Responsive density, 1.1x increase
        
        for (let i = 0; i < numParticles; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            
            particles.push({
                x: x, 
                y: y,
                baseX: x, 
                baseY: y,
                vx: (Math.random() - 0.5) * 0.5, // Random slow drift
                vy: (Math.random() - 0.5) * 0.5,
                color: azureColors[Math.floor(Math.random() * azureColors.length)],
                size: Math.random() * 2.5 + 0.5
            });
        }
    }
    initParticles();
    // Re-init on resize to fill new space
    window.addEventListener('resize', initParticles);

    document.addEventListener('mousemove', (e) => {
        // mouse position
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // reset mouse when leaving window so particles aren't perpetually pushed
    document.addEventListener('mouseleave', () => {
        mouseX = -1000;
        mouseY = -1000;
    });

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        particles.forEach(p => {
            // Natural drift
            p.x += p.vx;
            p.y += p.vy;
            
            // Screen wrap-around for infinite background effect
            if (p.x < 0) { p.x = width; p.baseX = p.x; }
            if (p.x > width) { p.x = 0; p.baseX = p.x; }
            if (p.y < 0) { p.y = height; p.baseY = p.y; }
            if (p.y > height) { p.y = 0; p.baseY = p.y; }

            // Spring force towards their moving "base" location to stabilize
            // We slowly move the base location so they drift, but can be pushed and return
            p.baseX += p.vx;
            p.baseY += p.vy;

            // Antigravity (Repel) Force from Mouse
            const distToMouseX = mouseX - p.x;
            const distToMouseY = mouseY - p.y;
            const distToMouse = Math.sqrt(distToMouseX * distToMouseX + distToMouseY * distToMouseY);
            const maxDist = 200; // Radius of repel effect

            if (distToMouse < maxDist && distToMouse > 0) {
                const force = (maxDist - distToMouse) / maxDist;
                const pushStrength = force * 5; // Pushing force
                
                // Directly modify position for instant repel
                p.x -= (distToMouseX / distToMouse) * pushStrength;
                p.y -= (distToMouseY / distToMouse) * pushStrength;
            } else {
                // Return to base position if not being pushed
                const dx = p.baseX - p.x;
                const dy = p.baseY - p.y;
                p.x += dx * 0.05; // Spring back
                p.y += dy * 0.05;
            }

            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = 0.8;
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    animate();

    // 2. Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 3. Scroll Reveal Animation for Cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out, box-shadow 0.3s ease, border-color 0.3s ease';
        observer.observe(card);
    });
});
