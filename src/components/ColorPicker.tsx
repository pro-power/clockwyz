import React, { useState } from 'react';
import { CategoryColor } from '../models/ScheduleModel';
import '../styles/ColorPicker.css';

interface ColorPickerProps {
  categories: string[];
  defaultColors: string[];
  onComplete: (categoryColors: CategoryColor[]) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ 
  categories, 
  defaultColors, 
  onComplete 
}) => {
  const [selectedColors, setSelectedColors] = useState<CategoryColor[]>(
    categories.map((category, index) => ({
      category,
      color: defaultColors[index % defaultColors.length]
    }))
  );

  const handleColorSelect = (category: string, color: string) => {
    const updatedColors = selectedColors.map(item => 
      item.category === category ? { ...item, color } : item
    );
    setSelectedColors(updatedColors);
  };

  const handleComplete = () => {
    onComplete(selectedColors);
  };

  return (
    <div className="color-picker-grid">
      {selectedColors.map(({ category, color }) => (
        <div key={category} className="color-category-selector">
          <h3>{category}</h3>
          <div className="color-palette">
            {defaultColors.map(paletteColor => (
              <div 
                key={paletteColor}
                className={`color-circle ${color === paletteColor ? 'selected' : ''}`}
                style={{ 
                  backgroundColor: paletteColor,
                  border: color === paletteColor ? '3px solid black' : 'none'
                }}
                onClick={() => handleColorSelect(category, paletteColor)}
              />
            ))}
          </div>
        </div>
      ))}
      <button onClick={handleComplete}>Confirm Colors</button>
    </div>
  );
};

export default ColorPicker;