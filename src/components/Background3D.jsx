import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'

function ShimmeringBox({ position, rotationSpeed, color }) {
  const meshRef = useRef()
  const timeRef = useRef(0)
  
  useFrame((state, delta) => {
    timeRef.current += delta * rotationSpeed
    
    if (meshRef.current) {
      // Rotate the box
      meshRef.current.rotation.x = timeRef.current * 0.5
      meshRef.current.rotation.y = timeRef.current * 0.3
      
      // Float animation
      meshRef.current.position.y = position[1] + Math.sin(timeRef.current) * 0.5
    }
  })
  
  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        metalness={0.9}
        roughness={0.1}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </mesh>
  )
}

function ShimmeringBoxes() {
  const boxes = useMemo(() => {
    const boxesArray = []
    const colors = [
      '#6366f1', // Indigo
      '#8b5cf6', // Purple
      '#ec4899', // Pink
      '#06b6d4', // Cyan
      '#10b981', // Emerald
      '#f59e0b', // Amber
    ]
    
    for (let i = 0; i < 20; i++) {
      boxesArray.push({
        position: [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 20,
        ],
        rotationSpeed: 0.3 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }
    
    return boxesArray
  }, [])
  
  return (
    <>
      {boxes.map((box, index) => (
        <ShimmeringBox
          key={index}
          position={box.position}
          rotationSpeed={box.rotationSpeed}
          color={box.color}
        />
      ))}
    </>
  )
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#ec4899" />
      <spotLight
        position={[0, 15, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        color="#8b5cf6"
        castShadow
      />
    </>
  )
}

export default function Background3D() {
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      zIndex: 0,
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
    }}>
      <Canvas
        shadows
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: 'high-performance'
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={75} />
        <Lighting />
        <ShimmeringBoxes />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  )
}
