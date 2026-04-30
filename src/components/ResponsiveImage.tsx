import { useT } from '../lib/content';

type Props = {
  contentKey: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  mobileBreakpoint?: number;
};

export default function ResponsiveImage({
  contentKey,
  alt,
  className,
  priority = false,
  width,
  height,
  mobileBreakpoint = 767,
}: Props) {
  const t = useT();
  const desktop = t(`${contentKey}.desktop`, t(contentKey, ''));
  const mobile = t(`${contentKey}.mobile`, desktop);
  const altText = alt || t(`${contentKey}.alt`, '');

  if (!desktop) return null;

  return (
    <picture>
      {mobile && mobile !== desktop && (
        <source media={`(max-width: ${mobileBreakpoint}px)`} srcSet={mobile} />
      )}
      <img
        src={desktop}
        alt={altText}
        className={className}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </picture>
  );
}
