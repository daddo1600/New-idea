import type { Dictionary } from '../i18n';

/**
 * English needs entries only where a line changes with a number (plurals),
 * where two lines read the same in English but not in other languages, or
 * where a key is saved in trips and can't change but its English wording can;
 * everything else is the key itself.
 */
const en: Dictionary = {
  // The tab, not the place: "Inicio" rather than "Casa".
  'Home (tab)': 'Home',
  // The drive type (Work / Personal), not the saved place "Work": some languages say these differently.
  'Work (drive type)': 'Work',
  // A saved purpose (the key is stored with trips); couriers say "pickup", not "collection".
  'Delivery or collection': 'Delivery or pickup',
  days: { one: 'day', other: 'days' },
  '{{count}} days': { one: '{{count}} day', other: '{{count}} days' },
  '{{count}} days left': { one: '{{count}} day left', other: '{{count}} days left' },
  '{{count}} days left in the {{year}} tax year': {
    one: '{{count}} day left in the {{year}} tax year',
    other: '{{count}} days left in the {{year}} tax year',
  },
  '{{dueLine}}: {{count}} days to go': {
    one: '{{dueLine}}: {{count}} day to go',
    other: '{{dueLine}}: {{count}} days to go',
  },
  '{{count}} trips aren’t classified yet. Sort them first so the report is complete.': {
    one: '{{count}} trip isn’t classified yet. Sort it first so the report is complete.',
    other: '{{count}} trips aren’t classified yet. Sort them first so the report is complete.',
  },
  '{{count}} work drives need a purpose': {
    one: '{{count}} work drive needs a purpose',
    other: '{{count}} work drives need a purpose',
  },
  '{{count}} work drives have no purpose': {
    one: '{{count}} work drive has no purpose',
    other: '{{count}} work drives have no purpose',
  },
  '{{count}} purposes added': { one: '{{count}} purpose added', other: '{{count}} purposes added' },
  '{{count}}-day free trial': { one: '{{count}}-day free trial', other: '{{count}}-day free trial' },
  '{{count}}-month free trial': { one: '{{count}}-month free trial', other: '{{count}}-month free trial' },
  '{{count}} months': { one: '{{count}} month', other: '{{count}} months' },
  '{{count}} days free': { one: '{{count}} day free', other: '{{count}} days free' },
  '{{count}} months free': { one: '{{count}} month free', other: '{{count}} months free' },
  'Sort {{count}} drives': { one: 'Sort {{count}} drive', other: 'Sort {{count}} drives' },
  'Select {{count}} unsorted': { one: 'Select {{count}} unsorted', other: 'Select {{count}} unsorted' },
  '{{count}} selected': { one: '{{count}} selected', other: '{{count}} selected' },
  '{{distance}} for work · {{count}} to review': {
    one: '{{distance}} for work · {{count}} to review',
    other: '{{distance}} for work · {{count}} to review',
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
  '{{count}} minutes ago': { one: '{{count}} minute ago', other: '{{count}} minutes ago' },
  '{{count}} hours ago': { one: '{{count}} hour ago', other: '{{count}} hours ago' },
  '{{count}} days ago': { one: '{{count}} day ago', other: '{{count}} days ago' },
  '{{count}} drives': { one: '{{count}} drive', other: '{{count}} drives' },
  '{{purpose}} · {{count}} to sort': { one: '{{purpose}} · {{count}} to sort', other: '{{purpose}} · {{count}} to sort' },
  '{{count}} drives since then look like deliveries. They’ll be added to the shift as work.': {
    one: '{{count}} drive since then looks like a delivery. It’ll be added to the shift as work.',
    other: '{{count}} drives since then look like deliveries. They’ll be added to the shift as work.',
  },
  'Friends joined: {{count}}': { one: 'Friends joined: {{count}}', other: 'Friends joined: {{count}}' },
  '{{count}} friends joined': { one: '{{count}} friend joined', other: '{{count}} friends joined' },
  '{{count}} friends': { one: '{{count}} friend', other: '{{count}} friends' },
  '{{perk}}: {{count}} friends': { one: '{{perk}}: {{count}} friend', other: '{{perk}}: {{count}} friends' },
  '{{count}} more friend → {{perk}}': { one: '{{count}} more friend → {{perk}}', other: '{{count}} more friends → {{perk}}' },
  "{{count}} drives still to sort.": {
    "one": "{{count}} drive still to sort.",
    "other": "{{count}} drives still to sort."
  },
  "This week so far: {{distance}} for work over {{count}} drives, worth {{amount}} at {{authority}} rates.": {
    "one": "This week so far: {{distance}} for work over {{count}} drive, worth {{amount}} at {{authority}} rates.",
    "other": "This week so far: {{distance}} for work over {{count}} drives, worth {{amount}} at {{authority}} rates."
  },
  "This week so far: {{distance}} for work over {{count}} drives.": {
    "one": "This week so far: {{distance}} for work over {{count}} drive.",
    "other": "This week so far: {{distance}} for work over {{count}} drives."
  },
  "Last week: {{distance}} for work over {{count}} drives, worth {{amount}} at {{authority}} rates.": {
    "one": "Last week: {{distance}} for work over {{count}} drive, worth {{amount}} at {{authority}} rates.",
    "other": "Last week: {{distance}} for work over {{count}} drives, worth {{amount}} at {{authority}} rates."
  },
  "Last week: {{distance}} for work over {{count}} drives.": {
    "one": "Last week: {{distance}} for work over {{count}} drive.",
    "other": "Last week: {{distance}} for work over {{count}} drives."
  },
};

export default en;
