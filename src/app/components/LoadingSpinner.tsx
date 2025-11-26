export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-10 h-10 rounded-full border-2 border-white/10" />
        {/* Spinning gradient arc */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent-primary animate-spin" 
             style={{ animationDuration: '0.8s' }} />
        {/* Inner glow */}
        <div className="absolute inset-2 rounded-full bg-accent-primary/10 animate-pulse-slow" />
      </div>
    </div>
  );
}