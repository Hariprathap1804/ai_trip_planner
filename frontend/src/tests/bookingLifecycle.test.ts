import { describe, it, expect } from 'vitest';

describe('Simulated Booking Lifecycle & Reference Formatting', () => {
  const generateReference = () => {
    const digits = Math.floor(100000 + Math.random() * 900000);
    return `TP-${digits}`;
  };

  it('generates simulated booking reference matching TP-XXXXXX format', () => {
    const ref = generateReference();
    expect(ref).toMatch(/^TP-\d{6}$/);
  });

  it('calculates 12% simulated taxes and fees accurately', () => {
    const baseFare = 2000;
    const taxes = Math.round(baseFare * 0.12);
    const total = baseFare + taxes;

    expect(taxes).toBe(240);
    expect(total).toBe(2240);
  });

  it('updates booking status transition to CANCELLED', () => {
    const booking = {
      id: 'bk_123',
      reference_number: 'TP-992102',
      status: 'CONFIRMED',
    };

    const cancelledBooking = { ...booking, status: 'CANCELLED' };
    expect(cancelledBooking.status).toBe('CANCELLED');
    expect(cancelledBooking.reference_number).toBe('TP-992102');
  });
});
