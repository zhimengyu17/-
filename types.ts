export interface VelocityGradients {
  du_dx: number; // Linear strain rate x
  du_dy: number; // Shear/Rotation component
  dv_dx: number; // Shear/Rotation component
  dv_dy: number; // Linear strain rate y
}

export interface DerivedQuantities {
  divergence: number; // Volumetric strain rate
  vorticity: number; // 2 * angular velocity
  shearStrainRate: number; // Angular deformation rate
}

export enum DeformMode {
  COMBINED = 'COMBINED',
  LINEAR = 'LINEAR',
  ROTATION = 'ROTATION',
  ANGULAR = 'ANGULAR',
}