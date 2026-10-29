const replacements = {
  main: 'main',
  drafts: 'drafts',
  banks: 'banks',
  'an-1': 'analytics',
  'an-2': 'cashflow',
  'an-3': 'trends',
  'an-4': 'capital',
  receipt: 'receipt',
  voice: 'voice',
  'inv-1': 'invest',
  'inv-2': 'dividend',
  'inv-3': 'dividend',
  'inv-4': 'dividend',
  'main-a': 'main',
  'main-b': 'main',
  premium: 'premium',
  goals: 'goals',
  'goals-full': 'goals',
  plan: 'plan',
  calendar: 'calendar',
  chat: 'chat',
  accounts: 'accounts',
  accountEditor: 'accountEditor',
  salary: 'salary',
  shared: 'shared',
  fop: 'fop',
  debts: 'debts',
  credits: 'credits',
};
export function capturePath(path = '') {
  const match = path.match(/^assets\/screenshots\/app\/(uk|en)-([\w-]+)\.jpg$/);
  return match && replacements[match[2]]
    ? `assets/cinema/${match[1]}/screens/${replacements[match[2]]}.webp`
    : path;
}
