import {useState, useEffect, useRef} from "react";

const TypewriterEffect = ({text, speed = 15, onComplete}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const textRef = useRef("");

  // Handle both initial text and incremental updates
  useEffect(() => {
    // Reset jika teks baru lebih pendek (berarti ada input baru/reset)
    if (
      text.length < textRef.current.length ||
      !text.startsWith(textRef.current)
    ) {
      setDisplayedText("");
      setCurrentIndex(0);
    }
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    if (currentIndex < textRef.current.length) {
      const lag = textRef.current.length - currentIndex;

      // Mekanisme "Catch-up":
      // Jika tertinggal jauh, ketik lebih cepat atau lebih banyak karakter sekaligus
      const currentSpeed = lag > 30 ? 0 : speed;
      const jumpSize = lag > 100 ? 10 : lag > 50 ? 5 : 1;

      const timeout = setTimeout(() => {
        setDisplayedText(
          (prev) =>
            prev +
            textRef.current.substring(currentIndex, currentIndex + jumpSize),
        );
        setCurrentIndex((prev) => prev + jumpSize);
      }, currentSpeed);

      return () => clearTimeout(timeout);
    } else if (onComplete && textRef.current.length > 0) {
      onComplete();
    }
  }, [currentIndex, speed, onComplete, text]);

  return (
    <div className="relative inline-block w-full">
      <span className="opacity-100 transition-opacity duration-300">
        {displayedText}
      </span>
      {currentIndex < text.length && (
        <span className="inline-block w-[2px] h-[14px] ml-1 bg-brand-accent animate-pulse align-middle shadow-[0_0_8px_rgba(181,204,106,0.8)]"></span>
      )}
    </div>
  );
};

export default TypewriterEffect;
