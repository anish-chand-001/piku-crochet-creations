import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * A 3D yarn ball made from a toroidal knot geometry
 * with a fuzzy yarn-like material. Slowly rotates and
 * floats with a subtle breathing motion.
 */
const YarnBall = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Create a custom yarn-like material
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("hsl(350, 45%, 62%)"),
      roughness: 0.85,
      metalness: 0.05,
      emissive: new THREE.Color("hsl(350, 45%, 30%)"),
      emissiveIntensity: 0.1,
    });
  }, []);

  const material2 = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("hsl(148, 22%, 72%)"),
      roughness: 0.9,
      metalness: 0.05,
      emissive: new THREE.Color("hsl(148, 22%, 35%)"),
      emissiveIntensity: 0.05,
    });
  }, []);

  const material3 = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("hsl(38, 35%, 85%)"),
      roughness: 0.9,
      metalness: 0.02,
      emissive: new THREE.Color("hsl(25, 45%, 30%)"),
      emissiveIntensity: 0.05,
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Slow, organic rotation
      groupRef.current.rotation.y = t * 0.15;
      groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;
      // Subtle floating motion
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main yarn ball - torus knot gives it that wound-yarn look */}
      <mesh ref={meshRef} material={material} castShadow>
        <torusKnotGeometry args={[1, 0.35, 128, 32, 2, 3]} />
      </mesh>

      {/* Secondary yarn strand */}
      <mesh material={material2} position={[0.1, 0.1, 0.1]} rotation={[0.5, 0.3, 0]}>
        <torusKnotGeometry args={[1.05, 0.15, 100, 16, 3, 5]} />
      </mesh>

      {/* Accent strand */}
      <mesh material={material3} position={[-0.05, -0.05, 0.05]} rotation={[0.2, -0.4, 0.1]}>
        <torusKnotGeometry args={[1.1, 0.1, 80, 12, 4, 7]} />
      </mesh>
    </group>
  );
};

export default YarnBall;
