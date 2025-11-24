// Chart engine using d3-node for server-side SVG generation

import { D3Node } from 'd3-node';
import * as d3 from 'd3';
import fs from 'fs/promises';
import path from 'path';
import { ChartData, ColorScheme } from '@/lib/types';
import { BRAND_COLORS } from './colors';

export class ChartEngine {
  private outputDir: string;

  constructor(outputDir: string = './public/charts') {
    this.outputDir = outputDir;
  }

  async ensureOutputDir(): Promise<void> {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create output directory:', error);
    }
  }

  async createBarChart(
    data: ChartData,
    colorScheme: ColorScheme
  ): Promise<{ svgString: string; filePath: string }> {
    await this.ensureOutputDir();

    const colors = BRAND_COLORS[colorScheme];
    const d3n = new D3Node();

    const width = 800;
    const height = 600;
    const margin = { top: 60, right: 40, bottom: 80, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3n.createSVG(width, height);

    // Background
    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', colors.background);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3
      .scaleBand()
      .domain(data.labels)
      .range([0, chartWidth])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data.values) || 0])
      .nice()
      .range([chartHeight, 0]);

    // Bars
    g.selectAll('.bar')
      .data(data.values)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d, i) => x(data.labels[i]) || 0)
      .attr('y', d => y(d))
      .attr('width', x.bandwidth())
      .attr('height', d => chartHeight - y(d))
      .attr('fill', colors.primary);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('fill', colors.content)
      .style('font-size', '12px')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    g.selectAll('.domain, .tick line')
      .attr('stroke', colors.content);

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .attr('fill', colors.content)
      .style('font-size', '12px');

    g.selectAll('.domain, .tick line')
      .attr('stroke', colors.content);

    // Title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.content)
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .text(data.title);

    // Unit label
    if (data.unit) {
      svg
        .append('text')
        .attr('x', margin.left - 50)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', colors.content)
        .style('font-size', '12px')
        .attr('transform', `rotate(-90, ${margin.left - 50}, ${height / 2})`)
        .text(data.unit);
    }

    const svgString = d3n.svgString();
    const filePath = await this.saveChart(svgString, 'bar');

    return { svgString, filePath };
  }

  async createLineChart(
    data: ChartData,
    colorScheme: ColorScheme
  ): Promise<{ svgString: string; filePath: string }> {
    await this.ensureOutputDir();

    const colors = BRAND_COLORS[colorScheme];
    const d3n = new D3Node();

    const width = 800;
    const height = 600;
    const margin = { top: 60, right: 40, bottom: 80, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3n.createSVG(width, height);

    // Background
    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', colors.background);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3
      .scalePoint()
      .domain(data.labels)
      .range([0, chartWidth])
      .padding(0.5);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data.values) || 0])
      .nice()
      .range([chartHeight, 0]);

    // Line generator
    const line = d3
      .line<number>()
      .x((d, i) => x(data.labels[i]) || 0)
      .y(d => y(d));

    // Draw line
    g.append('path')
      .datum(data.values)
      .attr('fill', 'none')
      .attr('stroke', colors.primary)
      .attr('stroke-width', 3)
      .attr('d', line);

    // Draw points
    g.selectAll('.point')
      .data(data.values)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', (d, i) => x(data.labels[i]) || 0)
      .attr('cy', d => y(d))
      .attr('r', 5)
      .attr('fill', colors.primary);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('fill', colors.content)
      .style('font-size', '12px')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    g.selectAll('.domain, .tick line')
      .attr('stroke', colors.content);

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .attr('fill', colors.content)
      .style('font-size', '12px');

    g.selectAll('.domain, .tick line')
      .attr('stroke', colors.content);

    // Title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.content)
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .text(data.title);

    // Unit label
    if (data.unit) {
      svg
        .append('text')
        .attr('x', margin.left - 50)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', colors.content)
        .style('font-size', '12px')
        .attr('transform', `rotate(-90, ${margin.left - 50}, ${height / 2})`)
        .text(data.unit);
    }

    const svgString = d3n.svgString();
    const filePath = await this.saveChart(svgString, 'line');

    return { svgString, filePath };
  }

  private async saveChart(svgString: string, type: string): Promise<string> {
    const filename = `${type}-${Date.now()}.svg`;
    const filePath = path.join(this.outputDir, filename);
    await fs.writeFile(filePath, svgString);
    return filePath;
  }
}
