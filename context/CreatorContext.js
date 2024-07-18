// CreatorContext.js
import React, { createContext, useState, useContext } from 'react';

const CreatorContext = createContext();

export const useCreatorContext = () => {
    const context = useContext(CreatorContext);
    if (!context) {
        throw new Error('useCreatorContext must be used within a CreatorProvider');
    }
    return context;
};

export const CreatorProvider = ({ children }) => {
    const [activeCreator, setActiveCreator] = useState("");

    const value = { activeCreator, setActiveCreator };

    return (
        <CreatorContext.Provider value={value}>
            {children}
        </CreatorContext.Provider>
    );
};
