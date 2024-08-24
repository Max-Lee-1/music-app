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

    const [audioFeatures, setAudioFeatures] = useState(null);
    const [segments, setSegments] = useState([]);
    const currentSegmentIndex = useRef(0);
    const [startTime, setStartTime] = useState(null);

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

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor("#ffffff");
        containerRef.current.appendChild(renderer.domElement);
        if (!renderer) {
            console.error('Failed to initialize WebGL renderer.');
        }

        // Create sphere geometry and material
        const geometry = new THREE.IcosahedronGeometry(20, 3);
        const material = new THREE.MeshLambertMaterial({
            color: "#696969",
            wireframe: true
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

        const animate = () => {
            if (!isPlaying || segments.length === 0) return;

            const currentTime = (Date.now() - startTime); // Adjust time scale as needed
            const currentSegment = segments[currentSegmentIndex.current];

            if (currentSegment && currentTime > currentSegment.start) {
                currentSegmentIndex.current = (currentSegmentIndex.current + 1) % segments.length;
            }

            const loudness = currentSegment ? currentSegment.loudness_max : 0;
            const timbre = currentSegment ? currentSegment.timbre : [];

            // Example timbre features: brightness and attack
            const brightness = timbre[1] / 100; // Normalize brightness feature
            const attack = timbre[3] / 100;     // Normalize attack feature

            if (sphereRef.current) {
                // Rotate the sphere
                sphereRef.current.rotation.x += 0.001;
                sphereRef.current.rotation.y += 0.003;
                sphereRef.current.rotation.z += 0.005;

                // Warp the sphere based on loudness, brightness, and attack
                warpSphere(sphereRef.current, loudness, brightness, attack);
            }

            // Render the scene
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [audioContext, analyser, isPlaying, trackId, segments, startTime]);



    function warpSphere(mesh, loudness, brightness, attack) {
        console.log('Warping sphere with loudness:', loudness, 'brightness:', brightness, 'and attack:', attack);

        if (!mesh.geometry.isBufferGeometry) {
            console.error("Expected BufferGeometry");
            return;
        }

        const positions = mesh.geometry.attributes.position;
        const count = positions.count;

        // Modify scale sensitivity to loudness
        const globalScale = modulate(loudness, -30, 0, 0.5, 1.5); // The sphere gets larger with higher loudness

        // Increase noise impact with higher brightness and attack values
        // Increase noise impact with higher brightness and attack values
        const brightnessImpact = modulate(Math.abs(brightness), 0, 1, 0, 0.1); // Use absolute value for brightness
        const attackImpact = modulate(Math.abs(attack), 0, 1, 0, 0.1);       // Use absolute value for attack
        const time = window.performance.now();
        const rf = 0.00001; // Frequency of noise over time
        const amp = 5; // Amplitude of the noise

        for (let i = 0; i < count; i++) {
            const vertex = new THREE.Vector3();
            vertex.fromBufferAttribute(positions, i);

            vertex.normalize();

            // Adjust vertex distance based on loudness and noise
            let distance = mesh.geometry.parameters.radius * globalScale +
                (noise3D(vertex.x + time * rf * 4, vertex.y + time * rf * 6, vertex.z + time * rf * 7) * amp);

            // Further modify distance based on brightness and attack
            distance += brightnessImpact;
            distance -= attackImpact;

            // Update vertex position
            vertex.multiplyScalar(distance);

            positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }

        positions.needsUpdate = true;
        mesh.geometry.computeVertexNormals();
    }

    return <View ref={containerRef} style={{ flex: 1 }} />;
}
