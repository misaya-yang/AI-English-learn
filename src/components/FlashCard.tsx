import { type ReactNode, useRef } from 'react';
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { motionPresets } from '@/lib/motion';

const SWIPE_THRESHOLD = 100;

interface FlashCardProps {
  front: ReactNode;
  back: ReactNode;
  isFlipped: boolean;
  onFlip: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  minHeight?: string;
  className?: string;
}

export function FlashCard({
  front,
  back,
  isFlipped,
  onFlip,
  onSwipeLeft,
  onSwipeRight,
  minHeight = '520px',
  className,
}: FlashCardProps) {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 0.8, 1, 0.8, 0.5]);

  const hasDrag = !!onSwipeLeft || !!onSwipeRight;

  function handleDragEnd(_: unknown, info: PanInfo) {
    const { offset } = info;
    if (offset.x < -SWIPE_THRESHOLD && onSwipeLeft) {
      onSwipeLeft();
    } else if (offset.x > SWIPE_THRESHOLD && onSwipeRight) {
      onSwipeRight();
    }
  }

  return (
    <div ref={constraintsRef} className={cn('perspective-1000 relative w-full', className)}>
      <motion.div
        className="relative w-full"
        style={{
          minHeight,
          transformStyle: 'preserve-3d',
          ...(hasDrag ? { x, rotate, opacity } : {}),
        }}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={motionPresets.cardFlip.transition}
        drag={hasDrag ? 'x' : false}
        dragConstraints={constraintsRef}
        dragElastic={0.15}
        onDragEnd={hasDrag ? handleDragEnd : undefined}
      >
        {/* Front face */}
        <div
          className={cn(
            'absolute inset-0 backface-hidden',
            isFlipped && 'invisible',
          )}
          onClick={onFlip}
        >
          {front}
        </div>

        {/* Back face */}
        <div
          className={cn(
            'absolute inset-0 backface-hidden',
            !isFlipped && 'invisible',
          )}
          style={{ transform: 'rotateY(180deg)' }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
}
