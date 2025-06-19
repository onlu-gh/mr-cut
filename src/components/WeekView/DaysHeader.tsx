import {getUnixTime} from "date-fns";
import {Days} from './use-weekview';
import {useMediaQuery, useTheme} from '@mui/material';

export default function DaysHeader({days, onDayClick}: { days: Days, onDayClick?: (date: Date) => void }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <div className="sticky top-0 z-30 flex-none bg-slate-50 shadow">
            <div className={`grid grid-cols text-sm leading-6 text-slate-500`}
                 style={{gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`}}>
                {days.map((day, index) => (
                    <div key={getUnixTime(day.date)}
                         onClick={() => onDayClick?.(day.date)}
                         className={`flex items-center justify-center h-14 ${index === 0 && "border-l-0"} hover:bg-slate-100 hover:cursor-pointer`}>
                        <span className={day.isToday ? "flex items-center" : ""}>
                            <span className={`font-semibold text-slate-900 ml-1.5 ${
                                day.isToday &&
                                "flex items-center justify-center rounded-full w-8 h-8 ml-1.5 text-white bg-[#3c795b]"
                            }`}>
                                {day.dayOfMonthWithZero}
                            </span>
                            {isMobile ? day.shortName.split(' ')[1] : day.shortName}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
