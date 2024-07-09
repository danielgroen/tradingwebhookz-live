export const stepSizeToFixed = (stepSize: string | number): number => {
  return stepSize?.toString()?.split('.')[1]?.length ?? 0;
};
