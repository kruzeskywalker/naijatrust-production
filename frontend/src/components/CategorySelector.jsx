import React from 'react';
import { BUSINESS_CATEGORIES } from '../utils/constants';
import './CategorySelector.css';

/**
 * CategorySelector Component
 * 
 * A reusable component for selecting multiple categories.
 * 
 * @param {Object} props
 * @param {string[]} props.selectedCategories - Array of selected category strings
 * @param {function} props.onChange - Callback function(updatedCategories)
 * @param {boolean} [props.readOnly] - If true, interactions are disabled (optional)
 * @param {string[]} [props.availableCategories] - Optional custom list of categories
 */
const CategorySelector = ({
    selectedCategories = [],
    onChange,
    readOnly = false,
    availableCategories = BUSINESS_CATEGORIES
}) => {

    // Ensure selectedCategories is always an array
    const currentSelection = Array.isArray(selectedCategories) ? selectedCategories : [];

    const handleToggle = (category) => {
        if (readOnly) return;

        let updatedSelection;
        if (currentSelection.includes(category)) {
            updatedSelection = currentSelection.filter(c => c !== category);
        } else {
            updatedSelection = [...currentSelection, category];
        }

        onChange(updatedSelection);
    };

    return (
        <div className="category-selector-container">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Categories</label>
                <span className="selected-count-label">
                    {currentSelection.length} selected
                </span>
            </div>

            <div className="category-chips-wrapper">
                {availableCategories.map(category => {
                    const isSelected = currentSelection.includes(category);

                    return (
                        <label
                            key={category}
                            className={`category-chip ${isSelected ? 'selected' : ''} ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <input
                                type="checkbox"
                                value={category}
                                checked={isSelected}
                                onChange={() => handleToggle(category)}
                                disabled={readOnly}
                            />
                            {category}
                        </label>
                    );
                })}
            </div>
            {currentSelection.length === 0 && !readOnly && (
                <p className="text-xs text-red-500 mt-1">Please select at least one category.</p>
            )}
        </div>
    );
};

export default CategorySelector;
