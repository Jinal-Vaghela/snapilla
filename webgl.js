// WebGL Liquid Wave Burn & Photo Reveal Experience (Snapilla Studio)
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

        // Organic Noise & FBM for fluid liquid mechanics
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
            
            // Texture Aspect Ratio Fit (cover mode)
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

            // Flowing organic liquid wave
            float t = time * 0.7;
            float n1 = fbm(uv * 3.2 + vec2(sin(t * 0.35) * 0.4, t * 0.25));
            float n2 = fbm(uv * 5.5 - vec2(t * 0.2, cos(t * 0.3) * 0.3));
            
            // Multi-frequency wave crests
            float wave = (n1 * 0.24 + n2 * 0.12) + sin(uv.x * 5.5 + t * 0.6) * 0.045 + cos(uv.x * 10.0 - t * 0.4) * 0.02;
            
            // Mouse fluid ripple
            float mouseDist = distance(uv, mouse);
            float mouseEffect = smoothstep(0.4, 0.0, mouseDist) * 0.1 * sin(mouseDist * 18.0 - t * 2.5);
            
            // Upward liquid progress reveal mapping
            float threshold = progress * 1.45 - 0.2;
            float liquidHeight = uv.y + wave + mouseEffect;
            
            // Fluid refraction at the boundary
            vec2 fluidUv = coverUv + vec2(n1 - 0.5, n2 - 0.5) * 0.012 * smoothstep(0.12, 0.0, abs(liquidHeight - threshold));
            vec4 photoColor = texture2D(texture1, clamp(fluidUv, 0.0, 1.0));
            
            // Snapilla Signature Warm Amber & Golden Liquid
            vec3 liquidSurface = mix(vec3(1.0, 0.42, 0.02), vec3(1.0, 0.76, 0.08), uv.y + n1 * 0.25);
            
            // Glowing Meniscus / Burning Wave Line
            float edgeWidth = 0.035;
            float edge = smoothstep(threshold - edgeWidth, threshold, liquidHeight) * 
                         smoothstep(threshold + edgeWidth, threshold, liquidHeight);
            
            vec3 fireEdge = mix(vec3(1.0, 0.18, 0.0), vec3(1.0, 0.96, 0.4), edge * 1.6);
            
            vec3 finalColor;
            if (liquidHeight < threshold) {
                // Revealed photography banner
                finalColor = photoColor.rgb;
                // Golden caustics near the wave edge
                finalColor += fireEdge * edge * 2.0;
            } else {
                // Liquid wave surface
                finalColor = liquidSurface;
                // Fluid golden glow edge
                finalColor = mix(finalColor, fireEdge, edge * 4.5);
            }
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    class LiquidHero {
        constructor() {
            this.container = document.getElementById('webgl-container');
            if (!this.container) return;
            
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
            this.progress = 0.0;
            this.targetProgress = 0.0;
            
            this.init();
            this.addListeners();
        }

        init() {
            const loader = new THREE.TextureLoader();
            // Load banner.png
            loader.load('banner.png', (texture) => {
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                
                const imgWidth = texture.image.width || 1920;
                const imgHeight = texture.image.height || 1080;
                const screenWidth = this.container.offsetWidth || window.innerWidth;
                const screenHeight = this.container.offsetHeight || window.innerHeight;
                
                this.material = new THREE.ShaderMaterial({
                    uniforms: {
                        time: { value: 0 },
                        progress: { value: 0 },
                        texture1: { value: texture },
                        mouse: { value: this.mouse },
                        resolution: { value: new THREE.Vector2(screenWidth, screenHeight) },
                        imageResolution: { value: new THREE.Vector2(imgWidth, imgHeight) }
                    },
                    vertexShader,
                    fragmentShader
                });

                this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.material);
                this.scene.add(this.mesh);

                // Fluid upward wave rise animation on page load
                setTimeout(() => {
                    this.targetProgress = 0.92;
                }, 200);

                this.animate();
            }, undefined, (err) => {
                console.warn('WebGL banner.png load issue, retrying with sn banner.png:', err);
                loader.load('sn banner.png', (fallbackTexture) => {
                    this.material.uniforms.texture1.value = fallbackTexture;
                });
            });
        }

        addListeners() {
            window.addEventListener('scroll', () => {
                if (!this.container) return;
                const scrollY = window.scrollY;
                const heroHeight = this.container.offsetHeight || window.innerHeight;
                const scrollProgress = Math.min(Math.max(scrollY / (heroHeight * 0.7), 0), 1);
                this.targetProgress = Math.max(0.92, scrollProgress);
            });

            window.addEventListener('mousemove', (e) => {
                this.targetMouse.x = e.clientX / window.innerWidth;
                this.targetMouse.y = 1.0 - (e.clientY / window.innerHeight);
            });

            window.addEventListener('resize', () => {
                if (this.renderer && this.container) {
                    const w = this.container.offsetWidth || window.innerWidth;
                    const h = this.container.offsetHeight || window.innerHeight;
                    this.renderer.setSize(w, h);
                    if (this.material && this.material.uniforms.resolution) {
                        this.material.uniforms.resolution.value.set(w, h);
                    }
                }
            });
        }

        animate() {
            requestAnimationFrame(() => this.animate());
            if (this.material) {
                // Smooth upward progress transition
                this.progress += (this.targetProgress - this.progress) * 0.035;
                this.material.uniforms.progress.value = this.progress;
                this.material.uniforms.time.value += 0.035;
                
                // Mouse lerp
                this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.06;
                this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.06;
                this.material.uniforms.mouse.value = this.mouse;
            }
            this.renderer.render(this.scene, this.camera);
        }
    }

    const start = () => {
        if (window.THREE) {
            new LiquidHero();
        } else {
            setTimeout(start, 50);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
