// AudioVisualizer.jsx
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import axios from 'axios';
import * as THREE from 'three';
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise";

// Create a simplex noise generator
const simplex = new SimplexNoise();

// Helper function to generate 3D noise
function noise3D(x, y, z) {
    return simplex.noise3d(x, y, z);
}

// Helper function to map a value from one range to another
function modulate(val, minVal, maxVal, outMin, outMax) {
    const fractionate = (val, minVal, maxVal) => (val - minVal) / (maxVal - minVal);
    const fr = fractionate(val, minVal, maxVal);
    const delta = outMax - outMin;
    return outMin + (fr * delta);
}

export default function AudioVisualizer({ audioContext, analyser, trackId, isPlaying, token }) {
    // Refs for Three.js objects
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const sphereRef = useRef(null);
    const lightRef = useRef(null);

    const [audioFeatures, setAudioFeatures] = useState(null);
    const [segments, setSegments] = useState([]);
    const currentSegmentIndex = useRef(0);
    const [startTime, setStartTime] = useState(null);
    const [smoothedLoudness, setSmoothedLoudness] = useState(0);
    const [smoothedBrightness, setSmoothedBrightness] = useState(0);
    const [smoothedAttack, setSmoothedAttack] = useState(0);
    const [averageLoudness, setAverageLoudness] = useState(0);
    const loudnessBuffer = useRef([]);
    const BUFFER_SIZE = 7500; // Adjust this value to control the smoothing period

    // Buffers for different variables
    const brightnessBuffer = useRef([]);
    const attackBuffer = useRef([]);
    const [bassLoudness, setBassLoudness] = useState(0);

    useEffect(() => {
        // Fetch Spotify audio analysis when trackId changes
        if (trackId && token) {
            console.log(trackId);
            fetchSpotifyAudioAnalysis(trackId, token);
        }
    }, [trackId, token]);

    const fetchSpotifyAudioAnalysis = async (trackId, token) => {
        try {
            const response = await axios.get(
                `https://api.spotify.com/v1/audio-analysis/${trackId}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            const analysis = response.data;

            // Update states once, after all data is ready
            setAudioFeatures(analysis.track);
            setSegments(analysis.segments || []);
            setStartTime(Date.now());

            console.log("Tempo:", analysis.track.tempo);
            console.log("Audio Features:", analysis.track);
        } catch (error) {
            console.error("Error fetching Spotify audio analysis:", error);
            setAudioFeatures(null);
            setSegments([]);
        }
    };

    useEffect(() => {
        if (!containerRef.current) {
            console.error("Container ref is null.");
            return;
        }

        // Set up Three.js scene, camera, and renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 100;
        scene.add(camera);

        const container = containerRef.current;
        container.style.background = "transparent"; // Set background to transparent

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Enable alpha channel for transparency
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0); // Clear color with alpha value 0 (fully transparent)
        container.appendChild(renderer.domElement);

        if (!renderer) {
            console.error('Failed to initialize WebGL renderer.');
        }

        // Create sphere geometry and material
        const geometry = new THREE.IcosahedronGeometry(15, 25);
        const material = new THREE.MeshLambertMaterial({
            color: "#696969",
            wireframe: true,
            emissive: "#ffffff",
            emissiveIntensity: 0.1,
        });
        const sphere = new THREE.Mesh(geometry, material);

        // Add light and sphere to the scene
        const light = new THREE.DirectionalLight("#ffffff", 0.8);
        light.position.set(0, 50, 100);
        scene.add(light);
        scene.add(sphere);

        // Store references
        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;
        sphereRef.current = sphere;
        lightRef.current = light;

        // Handle window resize
        const handleResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            if (renderer && renderer.domElement && containerRef.current && containerRef.current.contains(renderer.domElement)) {
                containerRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    useEffect(() => {
        if (!audioContext || !analyser || !trackId || !isPlaying) return;

        let animationFrameId;
        let lastUpdateTime = 0;
        const updateInterval = 32; //At 16 - update every 16ms (approx. 60fps)

        const animate = () => {
            if (!isPlaying || segments.length === 0) return;

            const currentTime = (Date.now() - startTime); // Adjust time scale as needed
            if (currentTime - lastUpdateTime >= updateInterval) {
                lastUpdateTime = currentTime;

                const currentSegment = segments[currentSegmentIndex.current];

                if (currentSegment && currentTime > currentSegment.start) {
                    currentSegmentIndex.current = (currentSegmentIndex.current + 1) % segments.length;
                }

                const timbre = currentSegment ? currentSegment.timbre : [];
                const loudness = currentSegment ? currentSegment.loudness_start : 0;
                const timbreLoudness = timbre[0];
                const brightness = timbre[1] / 100; // Normalize brightness feature
                const flatness = timbre[2] / 100; // Normalize flatness feature
                const attack = timbre[3] / 100;     // Normalize attack feature
                const centroid = timbre[4] / 100;     // Normalize specteral centroid feature
                const rolloff = timbre[11] / 100; // Assuming dimension 11 corresponds to spectral rolloff

                console.log(brightness);

                // Calculate bass loudness
                const bassFactor = 1 - (centroid + rolloff) * 0.5; // Adjust this factor as needed
                const bassLoudness = timbreLoudness * bassFactor;
                setBassLoudness(bassLoudness);


                // Update loudness buffer
                loudnessBuffer.current.push(loudness);
                if (loudnessBuffer.current.length > BUFFER_SIZE) {
                    loudnessBuffer.current.shift();
                }

                // Calculate average loudness
                const newAverageLoudness = loudnessBuffer.current.reduce((sum, val) => sum + val, 0) / loudnessBuffer.current.length;
                setAverageLoudness(newAverageLoudness);

                if (sphereRef.current) {
                    // Rotate the sphere
                    sphereRef.current.rotation.x += 0.001;
                    sphereRef.current.rotation.y += 0.003;
                    sphereRef.current.rotation.z += 0.005;

                    // Warp the sphere based on loudness, brightness, and attack
                    warpSphere(sphereRef.current, loudness, brightness, flatness, attack, bassLoudness, centroid);
                    // Update light based on attack
                    // updateLight(lightRef.current, attack);
                    updateGlow(sphereRef.current, brightness);
                }

                // Render the scene
                if (rendererRef.current && sceneRef.current && cameraRef.current) {
                    rendererRef.current.render(sceneRef.current, cameraRef.current);
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [audioContext, analyser, isPlaying, trackId, segments, startTime, , smoothedBrightness, smoothedAttack]);

    function warpSphere(mesh, loudness, brightness, flatness, attack, bassLoudness, centroid) {
        //console.log('Warping sphere with loudness:', averageLoudness, 'brightness:', brightness, 'and attack:', attack);

        if (!mesh.geometry.isBufferGeometry) {
            console.error("Expected BufferGeometry");
            return;
        }

        const positions = mesh.geometry.attributes.position;
        const count = positions.count;

        // Modify scale sensitivity to loudness
        const globalScale = modulate(loudness, -30, 0, 2, 2.5); // The sphere gets larger with higher loudness
        const brightnessImpact = modulate(Math.abs(brightness), 0, 1, 0.5, 1); // Use absolute value for brightness
        const flatnessImpact = modulate(Math.abs(flatness), 0, 1, 0, 0.1); // Use absolute value
        const attackImpact = modulate(Math.abs(attack), 0, 1, 0.5, 1);       // Use absolute value for attack
        const time = window.performance.now();
        const rf = 0.00001; // Frequency of noise over time
        const amp = 2.5; // Amplitude of the noise

        for (let i = 0; i < count; i++) {
            const vertex = new THREE.Vector3();
            vertex.fromBufferAttribute(positions, i);

            vertex.normalize();

            // Base distance modified by loudness
            let distance = mesh.geometry.parameters.radius * globalScale * Math.PI / amp;

            // Add brightness-based jaggedness
            distance += (noise3D(vertex.x * 1.5, vertex.y * 1.5, vertex.z * 1.5) * ((centroid + attack) * 0.5)) * Math.PI * amp;

            // Add attack-based ripple effect
            //distance += attackImpact * Math.sin( time * rf * 500 + vertex.length() * Math.PI);

            // Update vertex position
            vertex.multiplyScalar(distance);

            positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }

        positions.needsUpdate = true;
        mesh.geometry.computeVertexNormals();
    }

    function updateLight(light, brightness) {
        if (!light) return;

        // Adjust light intensity based on attack
        const lightIntensity = modulate(brightness, 0, 1, 0.2, 2);
        light.intensity = lightIntensity;

        // Optional: Adjust light color based on attack
        const colorValue = modulate(brightness, 0, 1, 0, 1);
        light.color.setHSL(colorValue, 1, 0.5);
    }

    let currentColor = new THREE.Color(0.5, 0.5, 0.5);

    function updateGlow(mesh, brightness) {
        if (!mesh || !mesh.material) return;

        // Set emissive intensity directly
        const emissiveIntensity = THREE.MathUtils.lerp(0.2, 0.3, brightness);
        mesh.material.emissiveIntensity = emissiveIntensity;

        // Calculate target color
        const targetColorValue = THREE.MathUtils.lerp(0.4, 0.5, brightness);
        const targetColor = new THREE.Color(targetColorValue, targetColorValue, targetColorValue);

        // Smoothly interpolate current color towards target color
        currentColor.lerp(targetColor, 0.25); // Adjust this value to control smoothness

        // Apply the interpolated color
        mesh.material.emissive.copy(currentColor);
    }

    return <View ref={containerRef} style={{ position: "fixed", top: "0", background: "none" }} />;
}
