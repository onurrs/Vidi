import React, { createContext, useState, useContext } from 'react';

const VideoContext = createContext();

export const useVideoContext = () => {
    return useContext(VideoContext);
};

export const VideoProvider = ({ children }) => {
    const [activeVideo, setActiveVideo] = useState("");

    return (
        <VideoContext.Provider value={{ activeVideo, setActiveVideo }}>
            {children}
        </VideoContext.Provider>
    );
};