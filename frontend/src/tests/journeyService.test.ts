import { describe, it, expect } from 'vitest';

describe('Journey Search & Multi-criteria Filtering', () => {
  const sampleJourneys = [
    { id: '1', mode: 'flight', fare: 3200, duration: 60, operator: 'IndiGo', stops: 0 },
    { id: '2', mode: 'flight', fare: 4800, duration: 90, operator: 'Air India', stops: 1 },
    { id: '3', mode: 'train', fare: 995, duration: 265, operator: 'Vande Bharat', stops: 2 },
    { id: '4', mode: 'bus', fare: 650, duration: 390, operator: 'KSRTC', stops: 3 },
  ];

  it('filters journeys strictly by maximum budget', () => {
    const budgetLimit = 1000;
    const filtered = sampleJourneys.filter((j) => j.fare <= budgetLimit);
    expect(filtered.length).toBe(2);
    expect(filtered.map((j) => j.id)).toEqual(['3', '4']);
  });

  it('filters direct flights with 0 stops', () => {
    const directFlights = sampleJourneys.filter((j) => j.mode === 'flight' && j.stops === 0);
    expect(directFlights.length).toBe(1);
    expect(directFlights[0].operator).toBe('IndiGo');
  });

  it('correctly ranks journeys by cheapest fare', () => {
    const sorted = [...sampleJourneys].sort((a, b) => a.fare - b.fare);
    expect(sorted[0].fare).toBe(650);
    expect(sorted[sorted.length - 1].fare).toBe(4800);
  });

  it('correctly ranks journeys by fastest total duration', () => {
    const sorted = [...sampleJourneys].sort((a, b) => a.duration - b.duration);
    expect(sorted[0].id).toBe('1');
    expect(sorted[0].duration).toBe(60);
  });
});
