/// <reference types="vite/client" />

// Pour les fichiers CSS modules
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// Pour les fichiers SVG avec ReactComponent
declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

// Pour les fichiers d'images
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.webp';

// Pour les fichiers de polices
declare module '*.woff';
declare module '*.woff2';
declare module '*.ttf';
declare module '*.eot';

// Pour les fichiers de vidéo
declare module '*.mp4';
declare module '*.webm';
declare module '*.ogg';

// Pour les fichiers audio
declare module '*.mp3';
declare module '*.wav';

// Configuration des alias de chemins
declare module '@/components/*';
declare module '@/pages/*';
declare module '@/services/*';
declare module '@/types/*';
declare module '@/utils/*';
declare module '@/assets/*';
