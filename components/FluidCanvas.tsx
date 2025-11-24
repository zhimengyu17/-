import React, { useMemo } from 'react';
import { VelocityGradients } from '../types';

interface FluidCanvasProps {
  gradients: VelocityGradients;
  t: number; // Time/Deformation factor
}

const FluidCanvas: React.FC<FluidCanvasProps> = ({ gradients, t }) => {
  const { du_dx, du_dy, dv_dx, dv_dy } = gradients;
  
  // Coordinate system configuration
  const viewSize = 400;
  const center = viewSize / 2;
  const scale = 100; // Pixels per unit length
  const squareSize = 1; // Unit square

  // Calculate deformed corners based on first-order Taylor series expansion
  // r_new = r_old + V * dt
  // u = u0 + (du/dx)*x + (du/dy)*y  (assuming u0, v0 = 0 at centroid for deformation view)
  // v = v0 + (dv/dx)*x + (dv/dy)*y

  // We define the square relative to its centroid to keep it centered visually
  const corners = [
    { x: -0.5, y: -0.5, label: 'A' },
    { x: 0.5, y: -0.5, label: 'B' },
    { x: 0.5, y: 0.5, label: 'C' },
    { x: -0.5, y: 0.5, label: 'D' },
  ];

  const deformedCorners = useMemo(() => {
    return corners.map(p => {
      // Velocity at point p (relative to centroid)
      const u = du_dx * p.x + du_dy * p.y;
      const v = dv_dx * p.x + dv_dy * p.y;

      // New position
      const xNew = p.x + u * t;
      const yNew = p.y + v * t;
      
      return { ...p, xNew, yNew, u, v };
    });
  }, [corners, du_dx, du_dy, dv_dx, dv_dy, t]);

  // Convert logical coordinates to SVG coordinates
  const toSvg = (x: number, y: number) => ({
    x: center + x * scale,
    y: center - y * scale, // SVG y-axis is inverted
  });

  const pointsString = deformedCorners
    .map(p => {
      const svg = toSvg(p.xNew, p.yNew);
      return `${svg.x},${svg.y}`;
    })
    .join(' ');

  const originalPointsString = corners
    .map(p => {
      const svg = toSvg(p.x, p.y);
      return `${svg.x},${svg.y}`;
    })
    .join(' ');

  return (
    <div className="w-full aspect-square bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-700 relative">
      <svg viewBox={`0 0 ${viewSize} ${viewSize}`} className="w-full h-full">
        {/* Grid Background */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Axes */}
        <line x1={center} y1={0} x2={center} y2={viewSize} stroke="#475569" strokeWidth="2" />
        <line x1={0} y1={center} x2={viewSize} y2={center} stroke="#475569" strokeWidth="2" />
        <text x={viewSize - 20} y={center + 20} fill="#94a3b8" fontSize="14">x</text>
        <text x={center + 10} y={20} fill="#94a3b8" fontSize="14">y</text>

        {/* Original Shape (Dotted) */}
        <polygon 
          points={originalPointsString} 
          fill="none" 
          stroke="#64748b" 
          strokeWidth="2" 
          strokeDasharray="5,5" 
        />

        {/* Deformed Shape */}
        <polygon 
          points={pointsString} 
          fill="rgba(59, 130, 246, 0.3)" 
          stroke="#3b82f6" 
          strokeWidth="3" 
        />

        {/* Corner Markers and Velocity Vectors */}
        {deformedCorners.map((p, i) => {
          const start = toSvg(p.x, p.y); // Vector starts from original position
          const end = toSvg(p.x + p.u * 0.5, p.y + p.v * 0.5); // Scaled vector for visibility

          // Only show vectors if t is small or zero, otherwise it gets cluttered. 
          // Or show displacement vectors? Let's show displacement from original to new.
          const currentPos = toSvg(p.xNew, p.yNew);

          return (
            <g key={i}>
              <circle cx={currentPos.x} cy={currentPos.y} r="4" fill="#60a5fa" />
              <text x={currentPos.x + 10} y={currentPos.y - 10} fill="white" fontSize="12">{p.label}</text>
            </g>
          );
        })}
      </svg>
      
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur text-xs text-white p-2 rounded">
        t = {t.toFixed(2)}
      </div>
    </div>
  );
};

export default FluidCanvas;