import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine
} from 'recharts';
import { convertToSlopeIntercept, parseVectors } from '../services/ollamaService';

interface EquationPlotProps {
  equations: string[];
}

const EquationPlot: React.FC<EquationPlotProps> = ({ equations }) => {
  // Check if we're dealing with vectors
  const isVectorPlot = equations.some(eq => eq.toLowerCase().includes('vector'));
  
  // Handle different types of plots
  return isVectorPlot ? <VectorPlot equations={equations} /> : <LinearEquationPlot equations={equations} />;
};

const LinearEquationPlot: React.FC<{equations: string[]}> = ({ equations }) => {
  const generatePoints = (slopeIntercept: { slope: number; intercept: number }, color: string) => {
    const { slope, intercept } = slopeIntercept;
    const points = [];
    
    // Generate points from x = -10 to x = 10 for better visualization
    for (let x = -10; x <= 10; x++) {
      const y = slope * x + intercept;
      points.push({ x, y });
    }
    
    return { points, color };
  };
  
  const equationData = equations.map((eq, index) => {
    const slopeIntercept = convertToSlopeIntercept(eq);
    // Use a professional color palette
    const colors = ["#4B7289", "#7E69AB", "#6E59A5", "#9b87f5", "#D6BCFA"];
    const color = colors[index % colors.length];
    return generatePoints(slopeIntercept, color);
  });
  
  const combinedPoints = [];
  for (let x = -10; x <= 10; x++) {
    const point: any = { x };
    equationData.forEach((eq, index) => {
      point[`y${index + 1}`] = eq.points.find(p => p.x === x)?.y;
    });
    combinedPoints.push(point);
  }

  const formatEquation = (eq: string, index: number) => {
    const cleanEq = eq.replace(/\s+/g, '');
    return `Equation ${index + 1}: ${cleanEq}`;
  };

  return (
    <div className="w-full h-64 bg-white/5 p-4 rounded-lg border border-mathBuddy-tealLight/20 my-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={combinedPoints}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis 
            dataKey="x" 
            domain={[-10, 10]} 
            type="number"
            tick={{ fill: "#DDD" }}
            tickCount={11}
          />
          <YAxis 
            domain={[-10, 10]} 
            tick={{ fill: "#DDD" }}
            tickCount={11}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1A1A1A', 
              border: '1px solid #2A2A2A',
              color: 'white'
            }} 
          />
          <Legend 
            formatter={(value, entry, index) => {
              return formatEquation(equations[index], index);
            }}
            wrapperStyle={{ color: '#DDD' }}
          />
          <ReferenceLine x={0} stroke="#666" />
          <ReferenceLine y={0} stroke="#666" />
          {equationData.map((eq, index) => (
            <Line 
              key={index} 
              type="monotone" 
              dataKey={`y${index + 1}`} 
              stroke={eq.color} 
              dot={false}
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const VectorPlot: React.FC<{equations: string[]}> = ({ equations }) => {
  // Parse vector information from equations
  const vectorsData = Object.entries(parseVectors(equations.join(' ')));
  
  // Generate the data for the chart
  const vectors = vectorsData.map(([name, coords]) => ({
    name,
    x: coords.x,
    y: coords.y
  }));
  
  // Add origin point
  const chartData = [
    { name: "O", x: 0, y: 0 },
    ...vectors
  ];
  
  // Calculate bounds for the chart
  const xValues = vectors.map(v => v.x);
  const yValues = vectors.map(v => v.y);
  const maxX = Math.max(5, ...xValues.map(Math.abs));
  const maxY = Math.max(5, ...yValues.map(Math.abs));

  return (
    <div className="w-full h-80 bg-white/5 p-4 rounded-lg border border-mathBuddy-tealLight/20 my-4">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis 
            type="number" 
            dataKey="x" 
            domain={[-maxX, maxX]} 
            tick={{ fill: "#DDD" }}
            name="X" 
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            domain={[-maxY, maxY]} 
            tick={{ fill: "#DDD" }}
            name="Y" 
          />
          <ZAxis range={[60, 60]} />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ 
              backgroundColor: '#1A1A1A', 
              border: '1px solid #2A2A2A',
              color: 'white'
            }}
            formatter={(value, name) => [value, name === 'x' ? 'X' : 'Y']}
          />
          <ReferenceLine x={0} stroke="#666" />
          <ReferenceLine y={0} stroke="#666" />
          <Scatter 
            name="Vectors" 
            data={chartData} 
            fill="#9b87f5"
            line={{ stroke: '#7E69AB', strokeWidth: 1 }}
            shape={(props) => {
              const { cx, cy, fill } = props;
              return (
                <circle cx={cx} cy={cy} r={5} fill={fill} />
              );
            }}
            label={(props) => {
              const { x, y, value } = props;
              return (
                <text 
                  x={x + 5} 
                  y={y - 5} 
                  fill="#fff" 
                  fontSize={12} 
                  textAnchor="start"
                >
                  {value}
                </text>
              );
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EquationPlot;
