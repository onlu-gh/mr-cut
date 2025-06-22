import type { Localize } from 'date-fns/locale/types'

const localizeIL: Localize = {
    ordinalNumber: (dirtyNumber) => {
        const number = Number(dirtyNumber)
        return number.toString()
    },

    era: (dirtyIndex, { width }) => {
        const values = {
            narrow: ['לפנה״ס', 'לסה״נ'],
            abbreviated: ['לפנה״ס', 'לסה״נ'],
            wide: ['לפני הספירה', 'לספירה']
        }

        return values[width][dirtyIndex]
    },

    quarter: (dirtyQuarter, { width }) => {
        const quarter = Number(dirtyQuarter)
        const values = {
            narrow: ['1', '2', '3', '4'],
            abbreviated: ['רבעון 1', 'רבעון 2', 'רבעון 3', 'רבעון 4'],
            wide: ['רבעון ראשון', 'רבעון שני', 'רבעון שלישי', 'רבעון רביעי']
        }

        return values[width][quarter - 1]
    },

    month: (dirtyMonth, { width }) => {
        const values = {
            narrow: ['י', 'פ', 'מ', 'א', 'מ', 'י', 'י', 'א', 'ס', 'א', 'נ', 'ד'],
            abbreviated: [
                'ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני',
                'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳'
            ],
            wide: [
                'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
                'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
            ]
        }

        return values[width][dirtyMonth]
    },

    day: (dirtyDay, { width }) => {
        const values = {
            narrow: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'],
            short: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'],
            abbreviated: ['יום א׳', 'יום ב׳', 'יום ג׳', 'יום ד׳', 'יום ה׳', 'יום ו׳', 'שבת'],
            wide: ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת']
        }

        return values[width][dirtyDay]
    },

    dayPeriod: (dirtyType, { width }) => {
        const values = {
            narrow: {
                am: 'לפנה״צ',
                pm: 'אחה״צ',
                midnight: 'חצות',
                noon: 'צהריים',
                morning: 'בוקר',
                afternoon: 'אחר הצהריים',
                evening: 'ערב',
                night: 'לילה'
            },
            abbreviated: {
                am: 'AM',
                pm: 'PM',
                midnight: 'חצות',
                noon: 'צהריים',
                morning: 'בוקר',
                afternoon: 'אחה״צ',
                evening: 'ערב',
                night: 'לילה'
            },
            wide: {
                am: 'לפני הצהריים',
                pm: 'אחרי הצהריים',
                midnight: 'חצות',
                noon: 'צהריים',
                morning: 'בבוקר',
                afternoon: 'אחר הצהריים',
                evening: 'בערב',
                night: 'בלילה'
            }
        }

        return values[width][dirtyType]
    }
}

export default localizeIL;