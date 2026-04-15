interface LogoProps {
  variant?: 'full' | 'icon';
  className?: string;
}

export function Logo({ variant = 'full', className = '' }: LogoProps) {
  if (variant === 'icon') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="w-8 h-8 rounded-lg bg-[#E8001C] flex items-center justify-center">
          <span className="text-white font-black text-sm">e</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="w-7 h-7 rounded-md bg-[#E8001C] flex items-center justify-center">
        <span className="text-white font-black text-xs">e</span>
      </div>
      <span className="font-semibold text-gray-800 tracking-tight text-lg">
        <span className="text-[#E8001C]">e</span>tranzact
      </span>
    </div>
  );
}
