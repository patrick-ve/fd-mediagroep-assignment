declare module 'd3-node' {
  export class D3Node {
    constructor(options?: any);
    createSVG(width?: number, height?: number): any;
    svgString(): string;
  }
}
