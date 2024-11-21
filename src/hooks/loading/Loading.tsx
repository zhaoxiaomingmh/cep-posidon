import React, { useEffect, useRef, useState } from 'react';
import './Loading.css';

export const Loading = () => {
    const [height, setHeight] = useState(30);
    const [height1, setHeight1] = useState(10);
    const [height2, setHeight2] = useState(30);
    const [boxShadow, setBoxShadow] = useState('0 0 #000');
    const requestRef = useRef<number>();
    const startTimeRef = useRef<number>();

    const animate = (time: number) => {
        if (!startTimeRef.current) {
            startTimeRef.current = time;
        }
        const progress = (time - startTimeRef.current) % 1000;

        if (progress < 400) {
            setHeight(10);
            setHeight1(40);
            setHeight2(20);
            setBoxShadow('0 -20px #000');
        } else {
            setHeight(40);
            setHeight1(10);
            setHeight2(30);
            setBoxShadow('0 0 #000');
        }

        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current!);
    }, []);

    return (
        <div className="loading" style={{ height: `${height}px`, boxShadow }}>
            <div className="loading-bar" style={{ height: `${height}px`, boxShadow }} />
            <div className="loading-bar" style={{ height: `${height1}px`, boxShadow }} />
            <div className="loading-bar" style={{ height: `${height2}px`, boxShadow }} />
            <div className="loading-bar" style={{ height: `${height}px`, boxShadow }} />
        </div>
    );
};