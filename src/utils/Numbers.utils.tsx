export const stepSizeToFixed = (stepSize: string | number) => {
  return stepSize.toString().split('.')[1].length;
};
