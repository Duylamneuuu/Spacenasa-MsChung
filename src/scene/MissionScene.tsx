import { Canvas } from '@react-three/fiber';
import type { MissionState } from '../types/game';

// Bảo owns src/scene: replace primitive boxes with the 2.5D mission-control room.
export type MissionSceneProps = {
  state: MissionState;
  onStationClick?: (station: 'briefing' | 'design' | 'launch' | 'operations') => void;
};

function Console({ position, onClick, color }: {
  position: [number, number, number]; onClick: () => void; color: string;
}) {
  return (
    <mesh position={position} onClick={onClick}>
      <boxGeometry args={[1.5, 0.55, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function MissionScene({ state, onStationClick }: MissionSceneProps) {
  return (
    <div className="scene-shell" aria-label="3D isometric mission-control preview">
      <Canvas orthographic camera={{ position: [7, 8, 7], zoom: 65, near: 0.1, far: 100 }}>
        <ambientLight intensity={1.7} />
        <directionalLight position={[5, 9, 4]} intensity={2.2} />
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[7, 0.25, 5]} />
          <meshStandardMaterial color="#243348" />
        </mesh>
        <Console position={[-1.6, 0.45, 0]} color="#2ca7c6" onClick={() => onStationClick?.('design')} />
        <Console position={[1.6, 0.45, 0]} color="#f59e6d" onClick={() => onStationClick?.('launch')} />
        <mesh position={[0, 0.7, -1.5]}>
          <boxGeometry args={[1, 1, 0.2]} />
          <meshStandardMaterial color={state.phase === 'launch' ? '#fca311' : '#4b5563'} />
        </mesh>
      </Canvas>
      <span className="scene-caption">Three.js placeholder · click a console</span>
    </div>
  );
}
