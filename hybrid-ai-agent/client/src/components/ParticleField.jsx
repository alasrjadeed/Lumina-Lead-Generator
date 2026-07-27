import { useMemo } from "react";

const ParticleField = ({ count = 50, className = "" }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 20,
      opacity: Math.random() * 0.5 + 0.1,
      color:
        Math.random() > 0.5
          ? "rgba(168, 85, 247, VAR)"
          : Math.random() > 0.5
          ? "rgba(34, 211, 238, VAR)"
          : "rgba(236, 72, 153, VAR)",
    }));
  }, [count]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <style>{`
        @keyframes particle-rise {
          0% {
            transform: translateY(100vh) translateX(0px) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateY(90vh) translateX(5px) scale(1);
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-10vh) translateX(-10px) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color.replace("VAR", String(p.opacity)),
            boxShadow: `0 0 ${p.size * 3}px ${p.color.replace("VAR", String(p.opacity * 0.5))}`,
            animation: `particle-rise ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
};

export default ParticleField;
