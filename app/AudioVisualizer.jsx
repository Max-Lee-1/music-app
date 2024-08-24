// AudioVisualizer.jsx
import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import * as THREE from 'three';
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise"

// Create a simplex noise generator
const simplex = new SimplexNoise();

// Helper function to generate 3D noise
function noise3D(x, y, z) {
    return simplex.noise3d(x, y, z);
}

export default function AudioVisualizer({ audioContext, analyser, isPlaying }) {
    const ws = useRef(null);
    // Refs for Three.js objects
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const sphereRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Set up Three.js scene, camera, and renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 100;
        scene.add(camera);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor("#ffffff");

        containerRef.current.appendChild(renderer.domElement);

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
            if (containerRef.current && renderer.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    useEffect(() => {
        if (!audioContext || !analyser || !isPlaying) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const animate = () => {
            analyser.getByteFrequencyData(dataArray)

            // Calculate loudness
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                const amplitude = (dataArray[i] - 128) / 128; // normalize to [-1, 1]
                sum += amplitude * amplitude;
            }
            const rms = Math.sqrt(sum / bufferLength);
            const loudness = Math.pow(rms, 0.8); // Increase sensitivity

            if (sphereRef.current) {
                // Rotate the sphere
                sphereRef.current.rotation.x += 0.001;
                sphereRef.current.rotation.y += 0.003;
                sphereRef.current.rotation.z += 0.005;

                // Warp the sphere based on loudness
                warpSphere(sphereRef.current, loudness * 12);
            }

            // Render the scene
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }

            requestAnimationFrame(animate);
        };

        animate();
    }, [audioContext, analyser, isPlaying]);

    //useEffect(() => {
    //    if (!analyser || !isPlaying) return;
    //
    //    // Set up audio analysis
    //    const bufferLength = analyser.frequencyBinCount;
    //    const dataArray = new Uint8Array(bufferLength);
    //
    //    console.log("Data Array: " + dataArray);
    //
    //    // Animation loop
    //    const render = () => {
    //        if (!isPlaying) return;
    //
    //        // Get frequency data
    //        analyser.getByteFrequencyData(dataArray);
    //
    //
    //        // Calculate loudness
    //        let sum = 0;
    //        for (let i = 0; i < bufferLength; i++) {
    //            const amplitude = (dataArray[i] - 128) / 128; // normalize to [-1, 1]
    //            sum += amplitude * amplitude;
    //        }
    //        const rms = Math.sqrt(sum / bufferLength);
    //        const loudness = Math.pow(rms, 0.8); // Increase sensitivity
    //
    //        //console.log('Loudness:', loudness);
    //
    //        if (sphereRef.current) {
    //            // Rotate the sphere
    //            sphereRef.current.rotation.x += 0.001;
    //            sphereRef.current.rotation.y += 0.003;
    //            sphereRef.current.rotation.z += 0.005;
    //
    //            // Warp the sphere based on loudness
    //            warpSphere(sphereRef.current, loudness * 12, loudness * 4);
    //        }
    //
    //        // Render the scene
    //        if (rendererRef.current && sceneRef.current && cameraRef.current) {
    //            rendererRef.current.render(sceneRef.current, cameraRef.current);
    //        }
    //        requestAnimationFrame(render);
    //    };
    //
    //    render();
    //}, [analyser, isPlaying]);


    //INDIVIDUAL FREQUENCY 
    //// Split frequency data into lower and upper halves
    //const lowerHalf = dataArray.slice(0, (dataArray.length / 2) - 1);
    //const upperHalf = dataArray.slice((dataArray.length / 2) - 1, dataArray.length - 1);

    //// Calculate max and average frequencies
    //const lowerMax = Math.max(...lowerHalf);
    //const upperAvg = upperHalf.reduce((sum, val) => sum + val, 0) / upperHalf.length;

    //const lowerMaxFr = lowerMax / lowerHalf.length;
    //const upperAvgFr = upperAvg / upperHalf.length;

    //if (sphereRef.current) {
    //    // Rotate the sphere
    //    sphereRef.current.rotation.x += 0.001;
    //    sphereRef.current.rotation.y += 0.003;
    //    sphereRef.current.rotation.z += 0.005;

    //    // Warp the sphere based on audio data
    //    warpSphere(sphereRef.current, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));
    //}

    // Function to warp the sphere based on audio data
    function warpSphere(mesh, loudness) {
        if (!mesh.geometry.isBufferGeometry) {
            console.error("Expected BufferGeometry");
            return;
        }

        const positions = mesh.geometry.attributes.position;
        const count = positions.count;

        for (let i = 0; i < count; i++) {
            const vertex = new THREE.Vector3();
            vertex.fromBufferAttribute(positions, i);

            const offset = mesh.geometry.parameters.radius;
            const amp = 5;
            const time = window.performance.now();
            vertex.normalize();
            const rf = 0.00001;

            const loudnessImpact = 0.3; // Adjust this value between 0 and 1
            const noiseImpact = 0.4; // Adjust this value between 0 and 1

            const distance = offset + (loudness * loudnessImpact) + (noise3D(vertex.x + time * rf * 4, vertex.y + time * rf * 6, vertex.z + time * rf * 7) * amp * loudness * noiseImpact);

            vertex.multiplyScalar(distance);

            positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }

        positions.needsUpdate = true;
        mesh.geometry.computeVertexNormals();
    }

    return <View ref={containerRef} className="flex-1" />;
}

// Helper function to map a value from one range to another
function modulate(val, minVal, maxVal, outMin, outMax) {
    const fr = (val - minVal) / (maxVal - minVal);
    const delta = outMax - outMin;
    return outMin + (fr * delta);
}