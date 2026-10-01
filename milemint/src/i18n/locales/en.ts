import type { Dictionary } from '../i18n';

/**
 * English needs entries only where a line changes with a number (plurals);
 * everything else is the key itself.
 */
const en: Dictionary = {
  days: { one: 'day', other: 'days' },
  '{{count}} days': { one: '{{count}} day', other: '{{count}} days' },
  '{{count}} days left': { one: '{{count}} day left', other: '{{count}} days left' },
  '{{count}} days left in the {{year}} tax year': {
    one: '{{count}} day left in the {{year}} tax year',
    other: '{{count}} days left in the {{year}} tax year',
  },
  '{{count}} days until your {{year}} {{returnName}} is due': {
    one: '{{count}} day until your {{year}} {{returnName}} is due',
    other: '{{count}} days until your {{year}} {{returnName}} is due',
  },
  '{{dueLine}}: {{count}} days to go': {
    one: '{{dueLine}}: {{count}} day to go',
    other: '{{dueLine}}: {{count}} days to go',
  },
  '{{count}} a month': { one: '{{count}} a month', other: '{{count}} a month' },
  '{{count}} saved drives have their value waiting for Pro': {
    one: '{{count}} saved drive has its value waiting for Pro',
    other: '{{count}} saved drives have their value waiting for Pro',
  },
  '{{count}} drives are saved and shown in full. Their value unlocks with Pro.': {
    one: '{{count}} drive is saved and shown in full. Its value unlocks with Pro.',
    other: '{{count}} drives are saved and shown in full. Their value unlocks with Pro.',
  },
  '{{count}} drives past the free plan’s monthly limit aren’t in these totals. They’re in the spreadsheet; their value unlocks with Pro.': {
    one: '{{count}} drive past the free plan’s monthly limit isn’t in these totals. It’s in the spreadsheet; its value unlocks with Pro.',
    other:
      '{{count}} drives past the free plan’s monthly limit aren’t in these totals. They’re in the spreadsheet; their value unlocks with Pro.',
  },
  'Free: {{count}} work drives a month. Pro: unlimited.': {
    one: 'Free: {{count}} work drive a month. Pro: unlimited.',
    other: 'Free: {{count}} work drives a month. Pro: unlimited.',
  },
  'Free: {{count}} work drives a month. Personal drives don’t count, and a shift counts once a day. Trips you add by hand are always free. Pro: unlimited.': {
    one: 'Free: {{count}} work drive a month. Personal drives don’t count, and a shift counts once a day. Trips you add by hand are always free. Pro: unlimited.',
    other:
      'Free: {{count}} work drives a month. Personal drives don’t count, and a shift counts once a day. Trips you add by hand are always free. Pro: unlimited.',
  },
  'Free: {{count}} work drives a month. Personal drives don’t count, and trips you add by hand are always free. Pro: unlimited.': {
    one: 'Free: {{count}} work drive a month. Personal drives don’t count, and trips you add by hand are always free. Pro: unlimited.',
    other:
      'Free: {{count}} work drives a month. Personal drives don’t count, and trips you add by hand are always free. Pro: unlimited.',
  },
  '{{count}} trips aren’t classified yet. Sort them first so the report is complete.': {
    one: '{{count}} trip isn’t classified yet. Sort it first so the report is complete.',
    other: '{{count}} trips aren’t classified yet. Sort them first so the report is complete.',
  },
  '{{count}}-day free trial': { one: '{{count}}-day free trial', other: '{{count}}-day free trial' },
  '{{count}}-month free trial': { one: '{{count}}-month free trial', other: '{{count}}-month free trial' },
  'Free plan: {{count}} work drives a month (personal drives don’t count), unlimited trips by hand and the spreadsheet export.': {
    one: 'Free plan: {{count}} work drive a month (personal drives don’t count), unlimited trips by hand and the spreadsheet export.',
    other:
      'Free plan: {{count}} work drives a month (personal drives don’t count), unlimited trips by hand and the spreadsheet export.',
  },
  'Sort {{count}} drives': { one: 'Sort {{count}} drive', other: 'Sort {{count}} drives' },
  'Select {{count}} unsorted': { one: 'Select {{count}} unsorted', other: 'Select {{count}} unsorted' },
  '{{count}} selected': { one: '{{count}} selected', other: '{{count}} selected' },
  '{{distance}} business · {{count}} to review': {
    one: '{{distance}} business · {{count}} to review',
    other: '{{distance}} business · {{count}} to review',
  },
  'On shift for {{elapsed}}, {{count}} drives': {
    one: 'On shift for {{elapsed}}, {{count}} drive',
    other: 'On shift for {{elapsed}}, {{count}} drives',
  },
  '{{distance}} · {{value}} · {{count}} drives': {
    one: '{{distance}} · {{value}} · {{count}} drive',
    other: '{{distance}} · {{value}} · {{count}} drives',
  },
  'Claim it before {{date}}. {{total}} unclaimed across {{count}} earlier tax years.': {
    one: 'Claim it before {{date}}. {{total}} unclaimed across {{count}} earlier tax year.',
    other: 'Claim it before {{date}}. {{total}} unclaimed across {{count}} earlier tax years.',
  },
  'Done. {{count}} past trips now show only the area.': {
    one: 'Done. {{count}} past trip now shows only the area.',
    other: 'Done. {{count}} past trips now show only the area.',
  },
  '{{count}} past trips may still have addresses and routes. Replace them with the area only and delete the routes?': {
    one: '{{count}} past trip may still have an address and a route. Replace it with the area only and delete the route?',
    other: '{{count}} past trips may still have addresses and routes. Replace them with the area only and delete the routes?',
  },
  '{{count}} days to go': { one: '{{count}} day to go', other: '{{count}} days to go' },
  '{{count}} drives in this period aren’t sorted yet. They count as private until you sort them.': {
    one: '{{count}} drive in this period isn’t sorted yet. It counts as private until you sort it.',
    other: '{{count}} drives in this period aren’t sorted yet. They count as private until you sort them.',
  },
  '{{count}} business drives have no reason yet. The ATO asks for the reason for each journey.': {
    one: '{{count}} business drive has no reason yet. The ATO asks for the reason for each journey.',
    other: '{{count}} business drives have no reason yet. The ATO asks for the reason for each journey.',
  },
  'Backed up {{count}} minutes ago': {
    one: 'Backed up {{count}} minute ago',
    other: 'Backed up {{count}} minutes ago',
  },
  'Backed up {{count}} hours ago': {
    one: 'Backed up {{count}} hour ago',
    other: 'Backed up {{count}} hours ago',
  },
  'Backed up {{count}} days ago': {
    one: 'Backed up {{count}} day ago',
    other: 'Backed up {{count}} days ago',
  },
  'Backup from {{date}} with {{count}} trips': {
    one: 'Backup from {{date}} with {{count}} trip',
    other: 'Backup from {{date}} with {{count}} trips',
  },
  'Restored {{count}} trips from iCloud.': {
    one: 'Restored {{count}} trip from iCloud.',
    other: 'Restored {{count}} trips from iCloud.',
  },
  'Restore the backup from {{date}} with {{count}} trips. The trips, places, vehicles and settings on this iPhone are replaced by the ones in the backup.':
    {
      one: 'Restore the backup from {{date}} with {{count}} trip. The trips, places, vehicles and settings on this iPhone are replaced by the ones in the backup.',
      other:
        'Restore the backup from {{date}} with {{count}} trips. The trips, places, vehicles and settings on this iPhone are replaced by the ones in the backup.',
    },
  'Invites sent: {{count}}': { one: 'Invites sent: {{count}}', other: 'Invites sent: {{count}}' },
  'Friends joined: {{count}} · +{{drives}} free drives a month': {
    one: 'Friends joined: {{count}} · +{{drives}} free drives a month',
    other: 'Friends joined: {{count}} · +{{drives}} free drives a month',
  },
  '{{count}} minutes ago': { one: '{{count}} minute ago', other: '{{count}} minutes ago' },
  '{{count}} hours ago': { one: '{{count}} hour ago', other: '{{count}} hours ago' },
  '{{count}} days ago': { one: '{{count}} day ago', other: '{{count}} days ago' },
  'Your free plan: {{count}} automatic drives a month.': {
    one: 'Your free plan: {{count}} automatic drive a month.',
    other: 'Your free plan: {{count}} automatic drives a month.',
  },
  '{{count}} drives': { one: '{{count}} drive', other: '{{count}} drives' },
  '{{purpose}} · {{count}} to sort': { one: '{{purpose}} · {{count}} to sort', other: '{{purpose}} · {{count}} to sort' },
  '{{count}} drives since then look like deliveries. They’ll be added to the shift as business.': {
    one: '{{count}} drive since then looks like a delivery. It’ll be added to the shift as business.',
    other: '{{count}} drives since then look like deliveries. They’ll be added to the shift as business.',
  },
};

export default en;
