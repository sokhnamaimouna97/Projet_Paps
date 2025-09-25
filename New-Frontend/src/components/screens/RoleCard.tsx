import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export type RoleCardProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  bulletPoints: string[];
  accentClassName: string; // ex: bg-[#5CBCB6]
  borderClassName?: string; // ex: border-[#5CBCB6]/20
  circleBgClassName: string; // ex: bg-[#5CBCB6]/10
  circleHoverBgClassName?: string; // ex: group-hover:bg-[#5CBCB6]/20
  buttonText: string;
  buttonClassName?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  onClick: () => void;
  ariaLabel: string;
};

export default function RoleCard({
  icon,
  title,
  description,
  bulletPoints,
  accentClassName,
  borderClassName = '',
  circleBgClassName,
  circleHoverBgClassName,
  buttonText,
  buttonClassName,
  buttonVariant = 'default',
  onClick,
  ariaLabel,
}: RoleCardProps) {
  return (
    <Card
      className={`h-full min-h-[320px] cursor-pointer group transition-transform hover:-translate-y-0.5 hover:shadow-md rounded-xl ${borderClassName} focus:outline-none focus:ring-1 focus:ring-[#5CBCB6]/30 focus:ring-offset-0`}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <CardHeader className="text-center pb-3">
        <div className={`mx-auto w-16 h-16 ${circleBgClassName} rounded-full flex items-center justify-center mb-3 ${circleHoverBgClassName ?? ''} transition-colors`}>
          {icon}
        </div>
        <CardTitle className="text-xl text-[#2C3E50] dark:text-white">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-[#6C757D] dark:text-zinc-300">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <div className="space-y-6 mb-6">
          {bulletPoints.map((bp, idx) => (
            <div key={idx} className="flex items-center text-sm text-[#6C757D] dark:text-zinc-300">
              <div className={`w-2 h-2 bg-[#5CBCB6] rounded-full mr-2.5`} />
              {bp}
            </div>
          ))}
        </div>
        <Button
          onClick={onClick}
          className={`w-full ${buttonClassName || ''}`}
          variant={buttonVariant}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
