import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface ProgressChartProps {
  data: { date: string; reviews: number; score: number }[];
  title: string;
  type?: 'line' | 'bar';
}

// Simple chart implementation without external dependencies
const ProgressChart: React.FC<ProgressChartProps> = ({ data, title, type = 'line' }) => {
  const { theme } = useTheme();
  
  const maxReviews = Math.max(...data.map(d => d.reviews), 1);
  const maxScore = 100;
  const chartWidth = width - 64;
  const chartHeight = 150;

  const renderLineChart = () => {
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * chartWidth;
      const y = chartHeight - (item.score / maxScore) * chartHeight;
      return { x, y, score: item.score, reviews: item.reviews };
    });

    return (
      <View style={[styles.chartContainer, { width: chartWidth, height: chartHeight }]}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(value => (
          <View
            key={value}
            style={[
              styles.gridLine,
              {
                top: chartHeight - (value / 100) * chartHeight,
                backgroundColor: theme.colors.outline,
              },
            ]}
          />
        ))}
        
        {/* Data points and line */}
        {points.map((point, index) => (
          <View key={index}>
            {/* Line to next point */}
            {index < points.length - 1 && (
              <View
                style={[
                  styles.line,
                  {
                    left: point.x,
                    top: point.y,
                    width: Math.sqrt(
                      Math.pow(points[index + 1].x - point.x, 2) +
                      Math.pow(points[index + 1].y - point.y, 2)
                    ),
                    transform: [
                      {
                        rotate: `${Math.atan2(
                          points[index + 1].y - point.y,
                          points[index + 1].x - point.x
                        )}rad`,
                      },
                    ],
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
            )}
            
            {/* Data point */}
            <View
              style={[
                styles.dataPoint,
                {
                  left: point.x - 4,
                  top: point.y - 4,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
        ))}
        
        {/* Y-axis labels */}
        {[0, 25, 50, 75, 100].map(value => (
          <Text
            key={value}
            style={[
              styles.yAxisLabel,
              {
                top: chartHeight - (value / 100) * chartHeight - 8,
                color: theme.colors.onSurface,
              },
            ]}>
            {value}%
          </Text>
        ))}
      </View>
    );
  };

  const renderBarChart = () => {
    const barWidth = chartWidth / data.length - 8;
    
    return (
      <View style={[styles.chartContainer, { width: chartWidth, height: chartHeight }]}>
        {data.map((item, index) => {
          const barHeight = (item.reviews / maxReviews) * chartHeight;
          const x = index * (chartWidth / data.length) + 4;
          
          return (
            <View key={index}>
              <View
                style={[
                  styles.bar,
                  {
                    left: x,
                    bottom: 0,
                    width: barWidth,
                    height: barHeight,
                    backgroundColor: theme.colors.secondary,
                  },
                ]}
              />
              <Text
                style={[
                  styles.barLabel,
                  {
                    left: x,
                    bottom: barHeight + 4,
                    width: barWidth,
                    color: theme.colors.onSurface,
                  },
                ]}>
                {item.reviews}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
        {title}
      </Text>
      {type === 'line' ? renderLineChart() : renderBarChart()}
      
      {/* X-axis labels */}
      <View style={styles.xAxisContainer}>
        {data.map((item, index) => (
          <Text
            key={index}
            style={[
              styles.xAxisLabel,
              { color: theme.colors.onSurface, width: chartWidth / data.length },
            ]}>
            {new Date(item.date).getDate()}
          </Text>
        ))}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    position: 'relative',
    marginVertical: 16,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.3,
  },
  line: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bar: {
    position: 'absolute',
    borderRadius: 4,
  },
  yAxisLabel: {
    position: 'absolute',
    left: -30,
    fontSize: 10,
    textAlign: 'right',
    width: 25,
  },
  xAxisContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  xAxisLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  barLabel: {
    position: 'absolute',
    fontSize: 10,
    textAlign: 'center',
  },
});

export default ProgressChart;
