// WebGL Inverted Burn Effect (Starts Orange -> Reveals Photography from bottom)
(function() {
    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform float time;
        uniform float progress;
        uniform sampler2D texture1;
        uniform vec2 mouse;
        varying vec2 vUv;

        // Sharp Organic Noise for Burn Shapes
        float hash(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            for (int i = 0; i < 4; i++) {
                v += a * noise(p);
                p *= 2.0;
                a *= 0.5;
            }
            return v;
        }

        void main() {
            vec2 uv = vUv;
            
            // Jagged burn mask
            float n = fbm(uv * 3.0 + vec2(time * 0.02));
            float jagged = n * 0.4;
            float dist = distance(uv, mouse);
            float mouseEffect = smoothstep(0.3, 0.0, dist) * 0.08;
            
            // Progress mapping
            float threshold = progress * 1.3 - 0.15;
            float burnMask = uv.y + jagged + mouseEffect;
            
            // Image colors (The revealed layer)
            vec4 tex = texture2D(texture1, uv);
            vec3 imgColor = tex.a > 0.0 ? tex.rgb : vec3(1.0); // White fallback
            
            // Surface layer (Snapilla Orange)
            vec3 orangeSurface = mix(vec3(1.0, 0.45, 0.0), vec3(1.0, 0.65, 0.1), uv.y); 
            
            // Fire Edge Logic
            float edgeMask = smoothstep(threshold - 0.02, threshold, burnMask) * 
                             smoothstep(threshold + 0.02, threshold, burnMask);
            
            vec3 fire = mix(vec3(1.0, 0.2, 0.0), vec3(1.0, 0.9, 0.2), edgeMask);
            
            vec3 color;
            if(burnMask < threshold) {
                // Revealed photography
                color = imgColor;
            } else {
                // Still Orange
                color = orangeSurface;
                // Add fire line (High intensity)
                color = mix(color, fire, edgeMask * 6.0);
            }
            
            gl_FragColor = vec4(color, 1.0);
        }
    `;

    class InvertedBurn {
        constructor() {
            this.container = document.getElementById('webgl-container');
            if(!this.container) return;
            
            this.scene = new THREE.Scene();
            this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1, 1);
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.container.appendChild(this.renderer.domElement);
            
            this.mouse = new THREE.Vector2(0.5, 0.5);
            this.targetMouse = new THREE.Vector2(0.5, 0.5);
            this.progress = 0;
            
            this.init();
            this.addListeners();
        }

        init() {
            const texture = new THREE.TextureLoader().load('hero.png');
            this.material = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    progress: { value: 0 },
                    texture1: { value: texture },
                    mouse: { value: this.mouse }
                },
                vertexShader,
                fragmentShader
            });

            this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.material);
            this.scene.add(this.mesh);
            this.animate();
        }

        addListeners() {
            window.addEventListener('scroll', () => {
                const scrollY = window.scrollY;
                const heroHeight = this.container.offsetHeight;
                // Completes slightly faster to avoid feeling 'behind' the scroll
                this.progress = Math.min(Math.max(scrollY / (heroHeight * 0.7), 0), 1);
            });

            window.addEventListener('mousemove', (e) => {
                this.targetMouse.x = e.clientX / window.innerWidth;
                this.targetMouse.y = 1.0 - (e.clientY / window.innerHeight);
            });

            window.addEventListener('resize', () => {
                this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
            });
        }

        animate() {
            requestAnimationFrame(() => this.animate());
            if(this.material) {
                // Increased speed from 0.1 to 0.25 for better reactivity
                this.material.uniforms.progress.value += (this.progress - this.material.uniforms.progress.value) * 0.25;
                this.material.uniforms.time.value += 0.05;
                this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.1;
                this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.1;
                this.material.uniforms.mouse.value = this.mouse;
            }
            this.renderer.render(this.scene, this.camera);
        }
    }

    const start = () => {
        if(window.THREE) new InvertedBurn();
        else setTimeout(start, 50);
    };
    start();
})();
