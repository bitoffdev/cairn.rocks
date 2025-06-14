import React, { useEffect, useState } from 'react';

interface Rock {
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
  fill: string;
  layer: number;
  points: string; // For irregular polygon shape
}

const Cairn: React.FC = () => {
  const [rocks, setRocks] = useState<Rock[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const generateIrregularRockShape = (centerX: number, centerY: number, width: number, height: number, rotation: number) => {
    const numPoints = 8 + Math.floor(Math.random() * 4); // 8-11 points for irregular shape
    const points: string[] = [];
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
      
      // Create irregular radius with random variation
      const baseRadiusX = width * 0.5;
      const baseRadiusY = height * 0.5;
      const radiusVariationX = baseRadiusX * (0.7 + Math.random() * 0.6); // 70%-130% of base
      const radiusVariationY = baseRadiusY * (0.7 + Math.random() * 0.6);
      
      // Add some angular noise for more natural shape
      const angleNoise = (Math.random() - 0.5) * 0.3;
      const finalAngle = angle + angleNoise;
      
      const x = centerX + Math.cos(finalAngle) * radiusVariationX;
      const y = centerY + Math.sin(finalAngle) * radiusVariationY;
      
      points.push(`${x},${y}`);
    }
    
    return points.join(' ');
  };

  const generateCairn = () => {
    const newRocks: Rock[] = [];
    const baseY = 320;
    const centerX = 250;
    
    // Randomize layer structure - each cairn will be different
    const numLayers = 3 + Math.floor(Math.random() * 3); // 3-5 layers
    const layerStructure: number[] = [];
    
    // Generate random layer structure
    let maxRocksInLayer = 3 + Math.floor(Math.random() * 3); // Start with 3-5 rocks in base
    for (let i = 0; i < numLayers; i++) {
      if (i === numLayers - 1) {
        // Top layer always has 1 rock
        layerStructure.push(1);
      } else {
        // Random number of rocks, but generally decreasing
        const rocksInThisLayer = Math.max(1, maxRocksInLayer - Math.floor(Math.random() * 2));
        layerStructure.push(rocksInThisLayer);
        maxRocksInLayer = Math.max(1, rocksInThisLayer - Math.floor(Math.random() * 2));
      }
    }
    
    let currentY = baseY;
    let previousLayerRocks: Rock[] = [];
    
    layerStructure.forEach((rocksInLayer, layerIndex) => {
      const layerRocks: Rock[] = [];
      
      // Calculate layer properties with more variation
      const sizeFactor = 1 - (layerIndex * (0.15 + Math.random() * 0.1)); // 15-25% reduction per layer
      const baseWidth = 50 + Math.random() * 40; // 50-90px base width
      const baseHeight = 20 + Math.random() * 25; // 20-45px base height
      
      if (layerIndex === 0) {
        // Base layer - spread rocks out
        const totalWidth = rocksInLayer * 70; // Approximate spacing
        const startX = centerX - totalWidth / 2;
        
        for (let i = 0; i < rocksInLayer; i++) {
          const rockSizeVariation = 0.7 + Math.random() * 0.6; // 70%-130% size variation
          const width = baseWidth * sizeFactor * rockSizeVariation;
          const height = baseHeight * sizeFactor * rockSizeVariation;
          
          const spacing = totalWidth / Math.max(rocksInLayer - 1, 1);
          const x = rocksInLayer === 1 ? centerX : startX + (i * spacing) + (Math.random() - 0.5) * 20;
          const y = currentY - height;
          
          const rotation = (Math.random() - 0.5) * 25; // ±12.5 degrees
          const grayValue = 140 + Math.floor(Math.random() * 100);
          const fill = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
          
          const points = generateIrregularRockShape(x, y + height * 0.5, width, height, rotation);
          
          const rock = {
            width,
            height,
            x,
            y,
            rotation,
            fill,
            layer: layerIndex,
            points
          };
          
          layerRocks.push(rock);
        }
      } else {
        // Upper layers - position rocks to rest on rocks below
        if (previousLayerRocks.length === 0) return;
        
        for (let i = 0; i < rocksInLayer; i++) {
          const rockSizeVariation = 0.8 + Math.random() * 0.4;
          const width = baseWidth * sizeFactor * rockSizeVariation;
          const height = baseHeight * sizeFactor * rockSizeVariation;
          
          let x: number;
          let supportingRock: Rock;
          
          if (rocksInLayer === 1) {
            // Single rock on top - place over center of mass of previous layer
            const avgX = previousLayerRocks.reduce((sum, rock) => sum + rock.x, 0) / previousLayerRocks.length;
            x = avgX + (Math.random() - 0.5) * 15; // Small random offset
            supportingRock = previousLayerRocks[Math.floor(previousLayerRocks.length / 2)];
          } else {
            // Multiple rocks - distribute over previous layer
            const sectionWidth = previousLayerRocks.length > 1 ? 
              (Math.max(...previousLayerRocks.map(r => r.x)) - Math.min(...previousLayerRocks.map(r => r.x))) : 100;
            const sectionStart = Math.min(...previousLayerRocks.map(r => r.x));
            
            x = sectionStart + (i / Math.max(rocksInLayer - 1, 1)) * sectionWidth + (Math.random() - 0.5) * 20;
            
            // Find the closest supporting rock
            supportingRock = previousLayerRocks.reduce((closest, rock) => 
              Math.abs(rock.x - x) < Math.abs(closest.x - x) ? rock : closest
            );
          }
          
          // Position rock to rest on the supporting rock (no floating!)
          const y = supportingRock.y - height + (Math.random() * 6 - 3); // Small variation but always touching
          
          const rotation = (Math.random() - 0.5) * 20;
          const grayValue = 140 + Math.floor(Math.random() * 100);
          const fill = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
          
          const points = generateIrregularRockShape(x, y + height * 0.5, width, height, rotation);
          
          const rock = {
            width,
            height,
            x,
            y,
            rotation,
            fill,
            layer: layerIndex,
            points
          };
          
          layerRocks.push(rock);
        }
      }
      
      newRocks.push(...layerRocks);
      previousLayerRocks = layerRocks;
      
      // Update currentY based on the highest rock in current layer
      const highestY = Math.min(...layerRocks.map(rock => rock.y));
      currentY = highestY - 2; // Minimal gap
    });
    
    setRocks(newRocks);
  };

  useEffect(() => {
    generateCairn();
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div 
        className={`transition-opacity duration-1000 ease-in-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <svg
          width="500"
          height="400"
          viewBox="0 0 500 400"
          className="max-w-full h-auto"
        >
          {/* Ground line */}
          <line
            x1="100"
            y1="330"
            x2="400"
            y2="330"
            stroke="#f0f0f0"
            strokeWidth="1"
            opacity="0.5"
          />
          
          {/* Render rocks from bottom layer to top layer */}
          {rocks
            .sort((a, b) => b.layer - a.layer)
            .map((rock, index) => (
            <g key={index}>
              {/* Shadow */}
              <ellipse
                cx={rock.x + 3}
                cy={rock.y + rock.height * 0.9 + 4}
                rx={rock.width * 0.35}
                ry={rock.height * 0.12}
                fill="rgba(0, 0, 0, 0.2)"
                transform={`rotate(${rock.rotation * 0.4} ${rock.x + 3} ${rock.y + rock.height * 0.9 + 4})`}
              />
              
              {/* Main irregular rock shape */}
              <polygon
                points={rock.points}
                fill={rock.fill}
                stroke="#000000"
                strokeWidth={rock.layer === 0 ? "2.5" : "1.8"}
                strokeLinejoin="round"
                transform={`rotate(${rock.rotation} ${rock.x} ${rock.y + rock.height * 0.5})`}
              />
              
              {/* Highlight for dimension */}
              <ellipse
                cx={rock.x - rock.width * 0.15}
                cy={rock.y + rock.height * 0.3}
                rx={rock.width * 0.15}
                ry={rock.height * 0.1}
                fill="rgba(255, 255, 255, 0.4)"
                transform={`rotate(${rock.rotation - 10} ${rock.x} ${rock.y + rock.height * 0.5})`}
              />
              
              {/* Secondary highlight */}
              <ellipse
                cx={rock.x + rock.width * 0.1}
                cy={rock.y + rock.height * 0.7}
                rx={rock.width * 0.08}
                ry={rock.height * 0.05}
                fill="rgba(255, 255, 255, 0.25)"
                transform={`rotate(${rock.rotation + 20} ${rock.x} ${rock.y + rock.height * 0.5})`}
              />
            </g>
          ))}
        </svg>
        
        <div className="text-center mt-8">
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => {
                generateCairn();
                setIsVisible(true);
              }, 200);
            }}
            className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200 border border-gray-300 rounded-full hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Generate New Cairn
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cairn;