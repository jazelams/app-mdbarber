"use client";

import { useEffect, useState, useRef } from "react";

export default function WireframeWaves() {
    // We use a ref for the path elements to update them directly for performance
    // or we can use state. State might be fast enough for 15 lines.
    // Let's use State to keep it React-idiomatic first, if slow we optimize.
    const [paths, setPaths] = useState<string[]>([]);
    const requestRef = useRef<number>(0);
    const phaseRef = useRef<number>(0);

    useEffect(() => {
        const width = 1000;
        const height = 300;
        const numLines = 15; // Reduced slightly for performance
        const xStep = 20; // Optimization: fewer points

        const animate = () => {
            phaseRef.current += 0.05; // Speed of movement
            const phase = phaseRef.current;
            const newPaths = [];

            for (let i = 0; i < numLines; i++) {
                let path = `M 0 ${height}`;
                const yOffset = (i * (height * 0.4)) / numLines + (height * 0.2);

                // Parallel factor: lines move in sync but with slight offset
                const linePhase = i * 0.2;

                for (let x = 0; x <= width; x += xStep) {
                    // "Straight" waves: Very low amplitude sine
                    // "More movement": Phase is changing every frame

                    // Main rolling wave (straighter, essentially just a ripple)
                    const flow = Math.sin(x * 0.01 + phase + linePhase) * 10;

                    // Secondary detail (very subtle)
                    const detail = Math.cos(x * 0.03 - phase) * 2;

                    const y = height - yOffset - flow - detail;
                    path += ` L ${x} ${y}`;
                }
                newPaths.push(path);
            }
            setPaths(newPaths);
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    return (
        <div className="w-full h-full relative overflow-hidden">
            <svg
                viewBox="0 0 1000 300"
                preserveAspectRatio="none"
                className="w-full h-full"
            >
                <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8a6c1e" stopOpacity="0" />
                        <stop offset="20%" stopColor="#D4AF37" stopOpacity="0.5" />
                        <stop offset="50%" stopColor="#F7E7CE" stopOpacity="1" />
                        <stop offset="80%" stopColor="#D4AF37" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#8a6c1e" stopOpacity="0" />
                    </linearGradient>
                    {/* Enhanced Glow Filter */}
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {paths.map((d, i) => (
                    <path
                        key={i}
                        d={d}
                        fill="none"
                        stroke="url(#goldGradient)"
                        strokeWidth={1.5}
                        style={{
                            filter: "url(#glow)",
                            opacity: 0.3 + (i / 15) * 0.7 // More visible "reflejo"
                        }}
                    />
                ))}
            </svg>
            {/* Overlay to fade bottom into black */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
        </div>
    );
}
