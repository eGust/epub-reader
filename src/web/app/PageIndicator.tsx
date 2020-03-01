import React, { useCallback, useMemo, MouseEvent } from 'react';

export interface PageIndicatorProps {
  no: number;
  count: number;
  onUpdate: (newIndex: number) => void,
}

const PageIndicator = ({ no, count, onUpdate }: PageIndicatorProps) => {
  const blocks = useMemo<{ className: string, title: string }[]>(() => {
      if (count <= 0) return [];

      const r = new Array(count);
      for (let i = 0; i < count; i += 1) {
        r[i] = {
          className: i === no ? 'scroll-thumb' : 'scroll-block',
          title: `${i + 1}`,
        };
      }
      return r;
    },
    [count, no],
  );

  const onSelect = useCallback((ev: MouseEvent) => {
    const div = ev.target as HTMLDivElement;
    onUpdate(Number.parseInt(div.title, 10) - 1);
  }, [onUpdate]);

  return (
    <div className="page-indicator">
      <div className="label">{no + 1} / {count}</div>
      <div className="scroll-bar">
        {
          blocks.map(({ className, title }) => (
            <div key={title} {...{ className, title }} onClick={onSelect}></div>
          ))
        }
      </div>
    </div>
  );
};

export default PageIndicator;
