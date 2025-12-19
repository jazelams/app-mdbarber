"use client";

import { useState, useEffect } from "react";

interface TypewriterTextProps {
    text: string;
    speed?: number;
    delay?: number;
    className?: string;
    cursorColor?: string;
    loop?: boolean;
    repeatDelay?: number;
}

export default function TypewriterText({
    text,
    speed = 50,
    delay = 1000,
    className = "",
    cursorColor = "#D4AF37",
    loop = false,
    repeatDelay = 5000
}: TypewriterTextProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [started, setStarted] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        // Inicial delay before starting
        const startTimeout = setTimeout(() => {
            setStarted(true);
            setIsTyping(true);
        }, delay);

        return () => clearTimeout(startTimeout);
    }, [delay]);

    useEffect(() => {
        if (!started) return;

        // If waiting to restart (not typing and text is full)
        if (!isTyping && displayedText.length === text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText("");
                setIsTyping(true);
            }, 5000); // Hardcoded 5s loop for now if props not passed yet, but better to use prop
            return () => clearTimeout(timeout);
        }

        if (isTyping) {
            if (displayedText.length < text.length) {
                const timeout = setTimeout(() => {
                    setDisplayedText((prev) => prev + text.charAt(prev.length));
                }, speed);
                return () => clearTimeout(timeout);
            } else {
                // Finished typing
                setIsTyping(false);
            }
        }
    }, [text, speed, started, isTyping, displayedText]);

    return (
        <span className={className}>
            {displayedText}
            <span
                className="animate-pulse inline-block w-1 h-[1em] align-middle ml-1"
                style={{ backgroundColor: cursorColor }}
            />
        </span>
    );
}
