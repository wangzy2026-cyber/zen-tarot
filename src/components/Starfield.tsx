import { useMemo } from "react";

const Starfield = () => {
  const stars = useMemo(() => {
    const result: { x: number; y: number; size: number; opacity: number; twinkle: boolean; duration: number; delay: number }[] = [];
    for (let i = 0; i < 80; i++) {
      result.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.25 + 0.08,
        twinkle: i < 15,
        duration: Math.random() * 4 + 3,
        delay: Math.random() * 5,
      });
    }
    return result;
  }, []);

  return (
    <div className="starfield">
      {stars.map((s, i) => (
        <div
          key={i}
          className={`star ${s.twinkle ? "star-twinkle" : ""}`}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: s.twinkle ? undefined : s.opacity,
            "--duration": `${s.duration}s`,
            "--delay": `${s.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default Starfield;
