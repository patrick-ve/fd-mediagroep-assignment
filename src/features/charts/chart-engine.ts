// Chart engine using ECharts for server-side and client-side rendering

import * as echarts from 'echarts';
import fs from 'fs/promises';
import path from 'path';
import { ChartData, ColorScheme } from '@/lib/types';
import { BRAND_COLORS } from './colors';

export type EChartsOption = echarts.EChartsOption;

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
  ): Promise<{ svgString: string; filePath: string; echartsOptions: EChartsOption }> {
    await this.ensureOutputDir();

    const colors = BRAND_COLORS[colorScheme];
    const echartsOptions = this.getBarChartOptions(data, colors);

    // Server-side rendering
    const chart = echarts.init(null, null, {
      renderer: 'svg',
      ssr: true,
      width: 800,
      height: 600
    });

    chart.setOption(echartsOptions);
    const svgString = chart.renderToSVGString();
    chart.dispose();

    const filePath = await this.saveChart(svgString, 'bar');

    return { svgString, filePath, echartsOptions };
  }

  async createLineChart(
    data: ChartData,
    colorScheme: ColorScheme
  ): Promise<{ svgString: string; filePath: string; echartsOptions: EChartsOption }> {
    await this.ensureOutputDir();

    const colors = BRAND_COLORS[colorScheme];
    const echartsOptions = this.getLineChartOptions(data, colors);

    // Server-side rendering
    const chart = echarts.init(null, null, {
      renderer: 'svg',
      ssr: true,
      width: 800,
      height: 600
    });

    chart.setOption(echartsOptions);
    const svgString = chart.renderToSVGString();
    chart.dispose();

    const filePath = await this.saveChart(svgString, 'line');

    return { svgString, filePath, echartsOptions };
  }

  private getBarChartOptions(data: ChartData, colors: { primary: string; content: string; background: string }): EChartsOption {
    return {
      backgroundColor: colors.background,
      title: {
        text: data.title,
        left: 'center',
        top: 20,
        textStyle: {
          color: colors.content,
          fontSize: 18,
          fontWeight: 'bold'
        }
      },
      grid: {
        left: 80,
        right: 40,
        top: 80,
        bottom: 80,
        containLabel: false
      },
      xAxis: {
        type: 'category',
        data: data.labels,
        axisLine: {
          lineStyle: {
            color: colors.content
          }
        },
        axisLabel: {
          color: colors.content,
          fontSize: 12,
          rotate: 45
        },
        axisTick: {
          lineStyle: {
            color: colors.content
          }
        }
      },
      yAxis: {
        type: 'value',
        name: data.unit || '',
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: {
          color: colors.content,
          fontSize: 12
        },
        axisLine: {
          lineStyle: {
            color: colors.content
          }
        },
        axisLabel: {
          color: colors.content,
          fontSize: 12
        },
        splitLine: {
          lineStyle: {
            color: colors.content,
            opacity: 0.2
          }
        },
        axisTick: {
          lineStyle: {
            color: colors.content
          }
        }
      },
      series: [
        {
          data: data.values,
          type: 'bar',
          itemStyle: {
            color: colors.primary
          },
          barWidth: '60%'
        }
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      }
    };
  }

  private getLineChartOptions(data: ChartData, colors: { primary: string; content: string; background: string }): EChartsOption {
    return {
      backgroundColor: colors.background,
      title: {
        text: data.title,
        left: 'center',
        top: 20,
        textStyle: {
          color: colors.content,
          fontSize: 18,
          fontWeight: 'bold'
        }
      },
      grid: {
        left: 80,
        right: 40,
        top: 80,
        bottom: 80,
        containLabel: false
      },
      xAxis: {
        type: 'category',
        data: data.labels,
        axisLine: {
          lineStyle: {
            color: colors.content
          }
        },
        axisLabel: {
          color: colors.content,
          fontSize: 12,
          rotate: 45
        },
        axisTick: {
          lineStyle: {
            color: colors.content
          }
        }
      },
      yAxis: {
        type: 'value',
        name: data.unit || '',
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: {
          color: colors.content,
          fontSize: 12
        },
        axisLine: {
          lineStyle: {
            color: colors.content
          }
        },
        axisLabel: {
          color: colors.content,
          fontSize: 12
        },
        splitLine: {
          lineStyle: {
            color: colors.content,
            opacity: 0.2
          }
        },
        axisTick: {
          lineStyle: {
            color: colors.content
          }
        }
      },
      series: [
        {
          data: data.values,
          type: 'line',
          smooth: true,
          lineStyle: {
            color: colors.primary,
            width: 3
          },
          itemStyle: {
            color: colors.primary
          },
          symbol: 'circle',
          symbolSize: 8,
          showSymbol: true
        }
      ],
      tooltip: {
        trigger: 'axis'
      }
    };
  }

  private async saveChart(svgString: string, type: string): Promise<string> {
    const filename = `${type}-${Date.now()}.svg`;
    const filePath = path.join(this.outputDir, filename);
    await fs.writeFile(filePath, svgString);
    return filePath;
  }
}
