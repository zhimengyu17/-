import React from 'react';
import { VelocityGradients } from '../types';
import { RotateCcw, ArrowRightFromLine, MoveDiagonal } from 'lucide-react';

interface ControlPanelProps {
  gradients: VelocityGradients;
  onChange: (key: keyof VelocityGradients, value: number) => void;
  onReset: () => void;
}

const Slider: React.FC<{
  label: string;
  subLabel: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  icon?: React.ReactNode;
  colorClass?: string;
}> = ({ label, subLabel, value, min = -1, max = 1, onChange, icon, colorClass = "accent-blue-500" }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1">
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-mono text-sm font-bold text-slate-700">{label}</span>
      </div>
      <span className="text-xs text-slate-500 font-mono">{value.toFixed(2)}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={0.05}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer ${colorClass}`}
    />
    <p className="text-xs text-slate-400">{subLabel}</p>
  </div>
);

const ControlPanel: React.FC<ControlPanelProps> = ({ gradients, onChange, onReset }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          Velocity Gradients
        </h2>
        <button 
          onClick={onReset}
          className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
            <h3 className="text-xs font-bold uppercase text-blue-800 mb-3 tracking-wider">Linear Deformation</h3>
            <Slider
                label="∂u/∂x"
                subLabel="Extension/Compression in X"
                value={gradients.du_dx}
                onChange={(v) => onChange('du_dx', v)}
                icon={<ArrowRightFromLine size={14} className="text-blue-600"/>}
                colorClass="accent-blue-600"
            />
            <Slider
                label="∂v/∂y"
                subLabel="Extension/Compression in Y"
                value={gradients.dv_dy}
                onChange={(v) => onChange('dv_dy', v)}
                icon={<ArrowRightFromLine size={14} className="text-blue-600 rotate-90"/>}
                colorClass="accent-blue-600"
            />
        </div>

        <div className="p-4 bg-orange-50/50 rounded-lg border border-orange-100">
            <h3 className="text-xs font-bold uppercase text-orange-800 mb-3 tracking-wider">Shear & Rotation</h3>
            <Slider
                label="∂u/∂y"
                subLabel="Velocity u changes with y"
                value={gradients.du_dy}
                onChange={(v) => onChange('du_dy', v)}
                icon={<MoveDiagonal size={14} className="text-orange-600"/>}
                colorClass="accent-orange-600"
            />
            <Slider
                label="∂v/∂x"
                subLabel="Velocity v changes with x"
                value={gradients.dv_dx}
                onChange={(v) => onChange('dv_dx', v)}
                icon={<MoveDiagonal size={14} className="text-orange-600 scale-x-[-1]"/>}
                colorClass="accent-orange-600"
            />
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;