const v2 = '[a-z2-7]{16}.onion';
const v3 = '[a-z2-7]{56}.onion';

export const isOnion = (options: { exact: boolean }) =>
  options && options.exact
    ? new RegExp(`(?:^${v2}$)|(?:^${v3}$)`)
    : new RegExp(`${v2}|${v3}`, 'g');

isOnion.v2 = (options: { exact: boolean }) =>
  options && options.exact ? new RegExp(`^${v2}$`) : new RegExp(v2, 'g');
isOnion.v3 = (options: { exact: boolean }) =>
  options && options.exact ? new RegExp(`^${v3}$`) : new RegExp(v3, 'g');
