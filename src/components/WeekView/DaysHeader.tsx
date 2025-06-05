import {getUnixTime} from "date-fns";
import {Days} from './use-weekview';

export default function DaysHeader({days}: { days: Days }) {
    return (
        <div className="sticky top-0 z-30 flex-none bg-white shadow">
            <div className={`grid ${"grid-cols-" + days.length} text-sm leading-6 text-slate-500`}>
                {days.map((day, index) => (
                    <div key={getUnixTime(day.date)}
                         className={`
              flex items-center justify-center h-14 border-r border-gray-100
              ${index === 0 && "border-l-0"}
            `}>
            <span className={day.isToday ? "flex items-center" : ""}>
                <span
                    className={`
                  font-semibold text-slate-900 ml-1.5
                  ${
                        day.isToday &&
                        "flex items-center justify-center rounded-full w-8 h-8 ml-1.5 text-white bg-[#3c795b]"
                    }
                `}
                >
                {day.dayOfMonthWithZero}
              </span>
                {day.shortName}{" "}
            </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
