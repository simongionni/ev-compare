export type EnergyBetweenSocInput = {
  batteryCapacityKwh: number;
  fromSocPercent: number;
  toSocPercent: number;
};

export function energyBetweenSoc({
  batteryCapacityKwh,
  fromSocPercent,
  toSocPercent,
}: EnergyBetweenSocInput): number {
  return (
    (toSocPercent - fromSocPercent) * 0.01 * batteryCapacityKwh
  );
}