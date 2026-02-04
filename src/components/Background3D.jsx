import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

const STAR_COUNT = 4000

function Starfield() {
  const ref = useRef()
  const positions = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3)
    for (let i = 0; i < STAR_COUNT * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 80
      pos[i + 1] = (Math.random() - 0.5) * 80
      pos[i + 2] = (Math.random() - 0.5) * 80
    }
    return pos
  }, [])
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.012
    }
  })
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors={false}
        size={0.35}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#a78bfa"
        opacity={0.9}
      />
    </Points>
  )
}

function GlowOrb({ position, color, scale = 1 }) {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.3
    }
  })
  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.15}
      />
    </mesh>
  )
}

function HolographicRing() {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.1
      ref.current.rotation.z = state.clock.elapsedTime * 0.05
    }
  })
  return (
    <mesh ref={ref} position={[0, 0, -8]} rotation={[Math.PI / 2.5, 0, 0]}>
      <torusGeometry args={[6, 0.03, 16, 100]} />
      <meshBasicMaterial
        color="#8b5cf6"
        transparent
        opacity={0.4}
      />
    </mesh>
  )
}

function ParticleField() {
  const count = 800
  const ref = useRef()
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 40
      pos[i + 1] = (Math.random() - 0.5) * 40
      pos[i + 2] = (Math.random() - 0.5) * 40
    }
    return pos
  }, [])
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.01
    }
  })
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        size={0.15}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#c4b5fd"
        opacity={0.6}
      />
    </Points>
  )
}

export default function Background3D() {
  return (
    <div className="galactic-bg-wrap">
      <div className="galactic-gradient" />
      <div className="galactic-stars-css" aria-hidden="true" />
      <Canvas
        className="galactic-canvas"
        camera={{ position: [0, 0, 25], fov: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <fog attach="fog" args={['#0d0a1a', 22, 72]} />
        <color attach="background" args={['#050308']} />
        <ambientLight intensity={0.15} />
        <pointLight position={[10, 10, 10]} intensity={0.4} color="#8b5cf6" />
        <pointLight position={[-10, -5, 5]} intensity={0.3} color="#6366f1" />
        <pointLight position={[0, 10, -10]} intensity={0.2} color="#a78bfa" />
        <Starfield />
        <ParticleField />
        <GlowOrb position={[4, 2, -5]} color="#8b5cf6" scale={2} />
        <GlowOrb position={[-5, -2, -6]} color="#6366f1" scale={1.5} />
        <GlowOrb position={[0, 4, -10]} color="#a78bfa" scale={1} />
        <HolographicRing />
      </Canvas>
    </div>
  )
}
