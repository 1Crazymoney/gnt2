let stepCounter = 0;
export const announceStep = (step: string) =>
  console.log('\n\n\n', `...::: 👇 Step ${stepCounter++} - ${step} 👇 :::...`, '\n');
