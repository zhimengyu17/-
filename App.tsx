import React, { useState, useMemo, useEffect } from 'react';
import ControlPanel from './components/ControlPanel';
import FluidCanvas from './components/FluidCanvas';
import AnalysisPanel from './components/AnalysisPanel';
import { VelocityGradients, DerivedQuantities } from './types';
import { streamExplanation } from './services/geminiService';
import { BrainCircuit, Play, Pause, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  // State for velocity gradients
  const [gradients, setGradients] = useState<VelocityGradients>({
    du_dx: 0,
    du_dy: 0.5,
    dv_dx: 0,
    dv_dy: 0,
  });

  // Time / Deformation factor
  const [t, setT] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);

  // AI Explanation State
  const [explanation, setExplanation] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Derived calculations
  const derived = useMemo<DerivedQuantities>(() => {
    return {
      divergence: gradients.du_dx + gradients.dv_dy,
      vorticity: gradients.dv_dx - gradients.du_dy,
      shearStrainRate: 0.5 * (gradients.dv_dx + gradients.du_dy),
    };
  }, [gradients]);

  // Handle gradient changes
  const handleGradientChange = (key: keyof VelocityGradients, value: number) => {
    setGradients(prev => ({ ...prev, [key]: value }));
  };

  const resetGradients = () => {
    setGradients({ du_dx: 0, du_dy: 0, dv_dx: 0, dv_dy: 0 });
    setT(0.5);
    setIsPlaying(false);
    setExplanation("");
  };

  // Animation Loop
  useEffect(() => {
    let animationFrameId: number;
    if (isPlaying) {
      const animate = () => {
        setT(prev => {
          const next = prev + 0.005;
          return next > 1.5 ? 0 : next; // Loop
        });
        animationFrameId = requestAnimationFrame(animate);
      };
      animate();
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying]);

  // AI Tutor Function
  const askAi = async () => {
    if (!process.env.API_KEY) {
      setExplanation("API Key not found in environment.");
      return;
    }
    setIsAiLoading(true);
    setExplanation("");
    try {
      const stream = await streamExplanation(gradients, derived);
      
      for await (const chunk of stream) {
        if (chunk.text) {
          setExplanation(prev => prev + chunk.text);
        }
      }
    } catch (error) {
      setExplanation("Failed to get explanation. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Left Sidebar: Controls & Analysis */}
      <div className="w-full md:w-[400px] lg:w-[450px] p-4 flex flex-col gap-4 overflow-y-auto border-r border-slate-200 bg-white h-screen z-10 shadow-xl">
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Fluid Deformation</h1>
          <p className="text-sm text-slate-500">Interactive Gradient Tensor Model</p>
        </header>

        <ControlPanel 
          gradients={gradients} 
          onChange={handleGradientChange} 
          onReset={resetGradients}
        />
        
        <AnalysisPanel derived={derived} />

        {/* AI Tutor Section */}
        <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex-grow flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
              <BrainCircuit size={18} />
              AI Professor
            </h3>
            <button 
              onClick={askAi}
              disabled={isAiLoading}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {isAiLoading ? "Thinking..." : "Explain This State"}
            </button>
          </div>
          <div className="flex-grow bg-white rounded-lg p-3 text-sm text-slate-700 overflow-y-auto max-h-[300px] shadow-inner prose prose-sm prose-indigo leading-relaxed">
             {explanation ? (
               <div dangerouslySetInnerHTML={{ 
                 // Simple markdown-ish parsing for bold and line breaks
                 __html: explanation.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>') 
               }} />
             ) : (
               <div className="text-slate-400 italic text-center mt-8">
                 Adjust the sliders to see how the element deforms, then click "Explain This State" to get a physics interpretation.
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Main Content: Visualization */}
      <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center bg-slate-50 relative">
        <div className="max-w-2xl w-full">
            <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Visual Model</h2>
                  <p className="text-sm text-slate-500">
                    Visualizing 
                    <code className="mx-1 bg-slate-200 px-1 rounded">r_new = r + (∇V · r)Δt</code>
                  </p>
                </div>
                
                {/* Playback Controls */}
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm border border-slate-200">
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-2 hover:bg-slate-100 rounded text-slate-700"
                        title={isPlaying ? "Pause" : "Play Animation"}
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <div className="w-px h-6 bg-slate-200 mx-1"></div>
                    <button 
                        onClick={() => setT(0)}
                        className="p-2 hover:bg-slate-100 rounded text-slate-700"
                        title="Reset Time"
                    >
                        <RotateCcw size={16} />
                    </button>
                    <div className="flex flex-col px-2 w-32">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Deformation (t)</span>
                        <input 
                            type="range" min="0" max="1.5" step="0.01" 
                            value={t} 
                            onChange={(e) => {
                                setIsPlaying(false);
                                setT(parseFloat(e.target.value));
                            }}
                            className="h-1.5 bg-slate-200 rounded-full appearance-none accent-indigo-600"
                        />
                    </div>
                </div>
            </div>

            <FluidCanvas gradients={gradients} t={t} />

            {/* Educational Legend */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                    <div className="w-full h-1 bg-blue-500 rounded mb-2"></div>
                    <h4 className="font-bold text-sm text-slate-800">Linear Deformation</h4>
                    <p className="text-xs text-slate-500 mt-1">Stretching or compressing along axes. Controlled by ∂u/∂x and ∂v/∂y.</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                    <div className="w-full h-1 bg-orange-500 rounded mb-2"></div>
                    <h4 className="font-bold text-sm text-slate-800">Angular Deformation</h4>
                    <p className="text-xs text-slate-500 mt-1">Change in the angle between sides. Average of cross-gradients.</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                    <div className="w-full h-1 bg-green-500 rounded mb-2"></div>
                    <h4 className="font-bold text-sm text-slate-800">Rotation</h4>
                    <p className="text-xs text-slate-500 mt-1">Rigid body spinning without shape change. Difference of cross-gradients.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;