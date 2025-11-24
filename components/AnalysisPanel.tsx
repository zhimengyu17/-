import React from 'react';
import { DerivedQuantities } from '../types';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip } from 'recharts';

interface AnalysisPanelProps {
  derived: DerivedQuantities;
}

const StatCard: React.FC<{ title: string; value: number; unit?: string; formula: string; description: string }> = ({ 
  title, value, unit = "s⁻¹", formula, description 
}) => (
  <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between">
    <div>
        <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
            <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">{formula}</code>
        </div>
        <div className="text-2xl font-bold text-slate-900 mb-1">
            {value.toFixed(2)} <span className="text-sm font-normal text-slate-400">{unit}</span>
        </div>
    </div>
    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{description}</p>
  </div>
);

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ derived }) => {
  const chartData = [
    {
      name: 'Divergence',
      value: Math.abs(derived.divergence),
      fill: '#3b82f6',
    },
    {
      name: 'Vorticity',
      value: Math.abs(derived.vorticity),
      fill: '#10b981',
    },
    {
      name: 'Shear Rate',
      value: Math.abs(derived.shearStrainRate) * 2, // Scaling for visibility
      fill: '#f59e0b',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <StatCard 
        title="Divergence (∇·V)"
        value={derived.divergence}
        formula="∂u/∂x + ∂v/∂y"
        description="Rate of volume expansion. Positive means the fluid is expanding (less dense), negative means compressing."
      />
      <StatCard 
        title="Vorticity (ζ)"
        value={derived.vorticity}
        formula="∂v/∂x - ∂u/∂y"
        description="Twice the angular velocity. Measures local rotation of the fluid element."
      />
      <StatCard 
        title="Shear Strain Rate (ε̇xy)"
        value={derived.shearStrainRate}
        formula="0.5(∂v/∂x + ∂u/∂y)"
        description="Rate of angular deformation. How fast the right angle corner is changing (average change)."
      />
      
      {/* Mini Visualization using Recharts */}
      <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm flex items-center justify-center">
        <div className="h-32 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                    innerRadius="30%" 
                    outerRadius="100%" 
                    data={chartData} 
                    startAngle={180} 
                    endAngle={0}
                >
                    <RadialBar
                        background
                        dataKey="value"
                        cornerRadius={5}
                        label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }}
                    />
                    <Legend iconSize={8} layout="vertical" verticalAlign="middle" align="right" />
                    <Tooltip />
                </RadialBarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;