
import React from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'

function Background() {
  return (
    <>
      
      {/* Scene Background & Fog */}
      <color attach="background" args={['#a0a0a0']} />
      <fog attach="fog" args={['#a0a0a0', 200, 1000]} />

      {/* Hemisphere Light */}
      <hemisphereLight intensity={5} color={0xffffff} groundColor={0x444444} position={[0, 200, 0]} />

      {/* Directional Light */}
      <directionalLight
        intensity={8}
        position={[0, 200, 100]}
        castShadow
        shadow-camera-top={180}
        shadow-camera-bottom={-100}
        shadow-camera-left={-120}
        shadow-camera-right={120}
      />

      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2000, 3000]} />
        <meshPhongMaterial color={0x999999} depthWrite={false} />
      </mesh>

      {/* Grid Helper */}
      <gridHelper args={[2000, 20, 0x000000, 0x000000]} opacity={0.2} transparent />
    </>
  )
}
export default Background;