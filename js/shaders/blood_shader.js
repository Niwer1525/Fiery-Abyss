export const BloodShader = {
    name: 'BloodShader',
    uniforms: {
        'tDiffuse': { value: null },
        'health': { value: health }
    },
    vertexShader: /* glsl */`
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,

    fragmentShader: /* glsl */`
        #include <common>

        uniform sampler2D tDiffuse;
        uniform float health;

        varying vec2 vUv;

        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        void main() {
            vec4 texel = texture2D(tDiffuse, vUv); // Scene texture
            if(health > 50.0) { // If health is above 50, don't apply the shader
                gl_FragColor = texel;
                return;
            }

            float bloodIntensity = 1.0 - health * 0.01;
            float noise = random(vUv * bloodIntensity) * bloodIntensity;

            /* Generate blood color */
            vec3 bloodColor = vec3(0.8, 0.0, 0.0) * bloodIntensity * noise;

            // Calculate distance from the center of the texture
            float distance = length(vUv - vec2(0.5));

            // Apply a smoothstep function to create rounded edges
            float edge = smoothstep(0.45, 0.5 + health * 0.01, distance);

            // Mix the blood color with the original texture based on the edge value
            vec3 finalColor = mix(texel.rgb, bloodColor, edge);

            gl_FragColor = vec4(finalColor, 1.0);
        }`
};