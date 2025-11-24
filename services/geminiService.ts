import { GoogleGenAI } from "@google/genai";
import { VelocityGradients, DerivedQuantities } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const streamExplanation = async (
  gradients: VelocityGradients,
  derived: DerivedQuantities
) => {
  const prompt = `
    You are a friendly and expert fluid mechanics professor.
    Analyze the following velocity gradient tensor for a 2D fluid element:
    
    Gradient Tensor:
    du/dx = ${gradients.du_dx} (Rate of extension in x)
    du/dy = ${gradients.du_dy}
    dv/dx = ${gradients.dv_dx}
    dv/dy = ${gradients.dv_dy} (Rate of extension in y)

    Derived Physical Quantities:
    Divergence (Volumetric Expansion): ${derived.divergence.toFixed(2)}
    Vorticity (Rotation strength): ${derived.vorticity.toFixed(2)}
    Shear Strain Rate (Shape distortion): ${derived.shearStrainRate.toFixed(2)}

    Please explain:
    1. What is physically happening to the square fluid element (Stretching? Rotating? Shearing?).
    2. Connect the "Linear Deformation" and "Angular Deformation" concepts to these numbers.
    3. Use an intuitive analogy (e.g., stretching dough, a spinning wheel, a deck of cards sliding).
    
    Keep the explanation concise, encouraging, and easy to visualize. Max 200 words. Format with Markdown.
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return responseStream;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};