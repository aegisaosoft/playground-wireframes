import { useState, useEffect } from 'react';

interface AnimatedTypingTextProps {
  words: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export const AnimatedTypingText = ({ 
  words, 
  className = "", 
  typingSpeed = 120, 
  deletingSpeed = 70, 
  pauseDuration = 1000 
}: AnimatedTypingTextProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showCaret, setShowCaret] = useState(true);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setCurrentText(words[0]);
      setShowCaret(false);
      return;
    }

    const currentWord = words[currentWordIndex];
    
    const handleTyping = () => {
      if (isPaused) {
        setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, pauseDuration);
        return;
      }

      if (isDeleting) {
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      } else {
        if (currentText.length < currentWord.length) {
          setCurrentText(currentWord.slice(0, currentText.length + 1));
        } else {
          setIsPaused(true);
        }
      }
    };

    const speed = isDeleting ? deletingSpeed : typingSpeed;
    const timeoutId = setTimeout(handleTyping, speed);

    return () => clearTimeout(timeoutId);
  }, [currentText, isDeleting, isPaused, currentWordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

  // Caret blinking effect
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const caretInterval = setInterval(() => {
      setShowCaret(prev => !prev);
    }, 530);

    return () => clearInterval(caretInterval);
  }, []);

  return (
    <span className={className}>
      {currentText}
      <span className={`inline-block w-0.5 h-[0.8em] bg-current ml-0.5 ${showCaret ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`} />
    </span>
  );
};