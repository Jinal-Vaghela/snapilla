// WebGL Dynamic Liquid Photo Animation (Photo moves fluidly with liquid wave)
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
        uniform vec2 resolution;
        uniform vec2 imageResolution;
        varying vec2 vUv;

        // Sharp Organic Noise for Fluid Mechanics
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
                p *= 2.02;
                a *= 0.5;
            }
            return v;
        }

        void main() {
            vec2 uv = vUv;
            
            // Texture Aspect Ratio Cover Fit for sn banner.png / banner.png
            vec2 s = resolution;
            vec2 imgR = imageResolution;
            float rs = s.x / s.y;
            float ri = imgR.x / imgR.y;
            vec2 coverUv = uv;
            if (rs > ri) {
                coverUv.y = (uv.y - 0.5) * (rs / ri) + 0.5;
            } else {
                coverUv.x = (uv.x - 0.5) * (ri / rs) + 0.5;
            }

            // Flowing organic liquid wave mechanics
            float t = time * 0.75;
            float n1 = fbm(uv * 3.5 + vec2(sin(t * 0.3) * 0.35, t * 0.2));
            float n2 = fbm(uv * 5.0 - vec2(t * 0.15, cos(t * 0.25) * 0.25));
            
            // Interactive mouse fluid pull
            float mouseDist = distance(uv, mouse);
            float mouseRipple = smoothstep(0.4, 0.0, mouseDist) * 0.08 * sin(mouseDist * 16.0 - t * 2.5);
            vec2 mouseDir = normalize(uv - mouse + 0.001) * mouseRipple;
            
            // LIQUID PHOTO MOTION: Photo pixels dynamically flow and distort with the liquid wave
            vec2 liquidDisplacement = vec2(
                (n1 - 0.5) * 0.035 + sin(uv.y * 6.0 + t * 0.8) * 0.012,
                (n2 - 0.5) * 0.035 + cos(uv.x * 5.5 + t * 0.6) * 0.012
            ) + mouseDir;
            
            vec2 movingPhotoUv = clamp(coverUv + liquidDisplacement, 0.0, 1.0);
            vec4 tex = texture2D(texture1, movingPhotoUv);
            vec3 photoColor = (tex.a > 0.0 && length(tex.rgb) > 0.01) ? tex.rgb : vec3(0.98, 0.98, 0.98);
            
            // Surface layer (Signature Snapilla Vibrant Orange Gradient with Liquid Nuances)
            vec3 orangeBase = mix(vec3(1.0, 0.42, 0.0), vec3(1.0, 0.66, 0.08), uv.y + (n1 - 0.5) * 0.15);
            // Subtle fluid shimmering highlights to the orange surface
            vec3 orangeSurface = orangeBase + vec3(0.08, 0.05, 0.01) * (n2 - 0.5);

            // Upward burn mask and reveal progress
            float wave = (n1 - 0.5) * 0.14 + sin(uv.x * 5.5 + t * 0.5) * 0.035;
            float threshold = progress * 1.35 - 0.10;
            float burnMask = uv.y + wave + mouseRipple;
            
            // Glowing Fiery Burn Edge
            float edgeWidth = 0.04;
            float edge = smoothstep(threshold - edgeWidth, threshold, burnMask) * 
                         smoothstep(threshold + edgeWidth, threshold, burnMask);
            
            vec3 fire = mix(vec3(1.0, 0.18, 0.0), vec3(1.0, 0.95, 0.25), edge * 1.4);
            
            vec3 finalColor;
            if (burnMask >= threshold) {
                // Vibrant Snapilla Orange surface with interactive fluid dynamics
                finalColor = orangeSurface;
                // Add glowing fire flame line along the burn edge
                finalColor = mix(finalColor, fire, edge * 4.5);
            } else {
                // Revealed photography banner / underlying section on scroll
                finalColor = photoColor;
                finalColor += fire * edge * 2.5;
            }
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    class LiquidPhotoExperience {
        constructor() {
            this.container = document.getElementById('webgl-container');
            if(!this.container) return;
            
            this.scene = new THREE.Scene();
            this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1, 1);
            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            
            const width = this.container.offsetWidth || window.innerWidth;
            const height = this.container.offsetHeight || window.innerHeight;
            
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.container.appendChild(this.renderer.domElement);
            
            this.mouse = new THREE.Vector2(0.5, 0.5);
            this.targetMouse = new THREE.Vector2(0.5, 0.5);
            this.progress = 0;
            
            this.init();
            this.addListeners();
        }

        init() {
            const width = this.container.offsetWidth || window.innerWidth;
            const height = this.container.offsetHeight || window.innerHeight;

            const loader = new THREE.TextureLoader();

            this.material = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    progress: { value: 0 },
                    texture1: { value: new THREE.Texture() },
                    mouse: { value: this.mouse },
                    resolution: { value: new THREE.Vector2(width, height) },
                    imageResolution: { value: new THREE.Vector2(1920, 1080) }
                },
                vertexShader,
                fragmentShader
            });

            this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.material);
            this.scene.add(this.mesh);
            this.animate();

            const applyTexture = (tex) => {
                tex.minFilter = THREE.LinearFilter;
                tex.magFilter = THREE.LinearFilter;
                tex.needsUpdate = true;
                if(this.material) {
                    this.material.uniforms.texture1.value = tex;
                    const w = tex.image ? tex.image.width : 1920;
                    const h = tex.image ? tex.image.height : 1080;
                    this.material.uniforms.imageResolution.value.set(w, h);
                }
            };

            loader.load('banner.png', applyTexture, undefined, () => {
                loader.load('sn banner.png', applyTexture);
            });
        }

        addListeners() {
            window.addEventListener('scroll', () => {
                if(!this.container) return;
                const scrollY = window.scrollY;
                const heroHeight = this.container.offsetHeight || window.innerHeight;
                this.progress = Math.min(Math.max(scrollY / (heroHeight * 0.75), 0), 1);
            });

            window.addEventListener('mousemove', (e) => {
                this.targetMouse.x = e.clientX / window.innerWidth;
                this.targetMouse.y = 1.0 - (e.clientY / window.innerHeight);
            });

            window.addEventListener('resize', () => {
                if(this.renderer && this.container) {
                    const w = this.container.offsetWidth || window.innerWidth;
                    const h = this.container.offsetHeight || window.innerHeight;
                    this.renderer.setSize(w, h);
                    if(this.material && this.material.uniforms.resolution) {
                        this.material.uniforms.resolution.value.set(w, h);
                    }
                }
            });
        }

        animate() {
            requestAnimationFrame(() => this.animate());
            if(this.material) {
                this.material.uniforms.progress.value += (this.progress - this.material.uniforms.progress.value) * 0.22;
                this.material.uniforms.time.value += 0.04;
                this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.08;
                this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.08;
                this.material.uniforms.mouse.value = this.mouse;
            }
            this.renderer.render(this.scene, this.camera);
        }
    }

    const start = () => {
        if(window.THREE) new LiquidPhotoExperience();
        else setTimeout(start, 50);
    };

    if(document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
