import { describe, it, expect } from 'vitest';

describe('Multimodal Connection & Buffer Calculation', () => {
  const parseMinutes = (timeStr: string) => {
    const parts = timeStr.split(':').map(Number);
    return parts[0] * 60 + parts[1];
  };

  const calculateBuffer = (arrTime: string, depTime: string) => {
    let diff = parseMinutes(depTime) - parseMinutes(arrTime);
    if (diff < 0) diff += 24 * 60;
    return diff;
  };

  it('calculates connection buffer accurately', () => {
    const buffer = calculateBuffer('05:15', '05:45');
    expect(buffer).toBe(30);
  });

  it('flags tight transfers under 15 minutes', () => {
    const buffer = calculateBuffer('05:35', '05:45');
    const isTight = buffer < 15;
    expect(isTight).toBe(true);
  });

  it('sums cumulative fare across chained multimodal legs', () => {
    const legs = [
      { mode: 'cab', fare: 250 },
      { mode: 'train', fare: 995 },
      { mode: 'cab', fare: 180 },
    ];
    const totalFare = legs.reduce((acc, leg) => acc + leg.fare, 0);
    expect(totalFare).toBe(1425);
  });
});
