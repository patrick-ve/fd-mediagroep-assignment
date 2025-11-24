'use client';

// Chart display component using ECharts

import ReactECharts from 'echarts-for-react';
import { ChartData, ColorScheme } from '@/lib/types';
import { BRAND_COLORS } from '../charts/colors';
import type { EChartsOption } from 'echarts';

interface ChartDisplayProps {
  data: ChartData;
  colorScheme: ColorScheme;
}

export function ChartDisplay({ data, colorScheme }: ChartDisplayProps) {
  const colors = BRAND_COLORS[colorScheme];

  const getChartOptions = (): EChartsOption => {
    const baseOptions: EChartsOption = {
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
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: data.chartType === 'bar' ? 'shadow' : 'line'
        }
      }
    };

    if (data.chartType === 'bar') {
      return {
        ...baseOptions,
        series: [
          {
            data: data.values,
            type: 'bar',
            itemStyle: {
              color: colors.primary
            },
            barWidth: '60%'
          }
        ]
      };
    } else {
      return {
        ...baseOptions,
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
        ]
      };
    }
  };

  return (
    <div className="flex justify-center items-center p-4">
      <ReactECharts
        option={getChartOptions()}
        style={{ height: '600px', width: '800px' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
}
