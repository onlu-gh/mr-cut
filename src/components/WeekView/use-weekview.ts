import {useMemo, useState} from "react";
import {
    addDays,
    Day,
    eachDayOfInterval,
    eachMinuteOfInterval,
    format,
    isSameMonth,
    isSameYear,
    isToday,
    Locale,
    setHours,
    setMinutes,
    startOfDay,
    startOfWeek,
} from "date-fns";

export type WorkingHours = { start: string, end: string };

const DEFAULT_WEEK_DAYS_AMOUNT = 7;
const DEFAULT_DAY_START = '00:00';
const DEFAULT_DAY_END = '23:59';

export default function useWeekView({
                                        initialDate,
                                        minuteStep = 30,
                                        weekStartsOn = 0,
                                        locale,
                                        getWeeklySchedule,
                                        windowCell,
                                        disabledCell,
                                        disabledDay,
                                        disabledWeek,
                                    }:
                                        | {
                                        initialDate?: Date;
                                        minuteStep?: number;
                                        weekStartsOn?: Day;
                                        locale?: Locale;
                                        getWeeklySchedule?: (startDayOfWeek: Date) => WorkingHours[];
                                        windowCell?: (date: Date) => boolean;
                                        disabledCell?: (date: Date) => boolean;
                                        disabledDay?: (date: Date) => boolean;
                                        disabledWeek?: (startDayOfWeek: Date) => boolean;
                                    }
                                        | undefined = {}) {
    const [startOfTheWeek, setStartOfTheWeek] = useState(
        startOfWeek(startOfDay(initialDate || new Date()), {weekStartsOn})
    );

    const weeklySchedule = useMemo(() => {
        const schedule = getWeeklySchedule?.(startOfTheWeek);
        const weekDaysAmount = schedule?.length;
        const extremities = schedule?.length ?
            {
                earliestStart: schedule.filter((day) => day.start != null).map((day) => day.start).reduce((prev, curr) => curr < prev ? curr : prev).split(':').map(Number),
                latestEnd: schedule.filter((day) => day.end != null).map((day) => day.end).reduce((prev, curr) => curr > prev ? curr : prev).split(':').map(Number),
            } :
            {
                earliestStart: DEFAULT_DAY_START.split(':').map(Number),
                latestEnd: DEFAULT_DAY_END.split(':').map(Number),
            };

        return {
            weekDaysAmount,
            extremities,
            schedule,
        }
    }, [getWeeklySchedule, startOfTheWeek]);

    const nextWeek = useMemo(() => addDays(startOfTheWeek, DEFAULT_WEEK_DAYS_AMOUNT), [startOfTheWeek]);
    const previousWeek = useMemo(() => addDays(startOfTheWeek, -DEFAULT_WEEK_DAYS_AMOUNT), [startOfTheWeek]);

    const isPreviousWeekDisabled = useMemo(() => disabledWeek && disabledWeek(previousWeek), [disabledWeek, previousWeek]);
    const isNextWeekDisabled = useMemo(() => disabledWeek && disabledWeek(nextWeek), [disabledWeek, nextWeek]);

    const weekDaysAmount = weeklySchedule.weekDaysAmount ?? DEFAULT_WEEK_DAYS_AMOUNT;

    const showNextWeek = () => {
        if (isNextWeekDisabled) return;
        setStartOfTheWeek(nextWeek);
    };

    const showPreviousWeek = () => {
        if (isPreviousWeekDisabled) return;
        setStartOfTheWeek(previousWeek);
    };

    const goToToday = () => {
        setStartOfTheWeek(startOfWeek(startOfDay(new Date()), {weekStartsOn}));
    };

    const days = eachDayOfInterval({
        start: startOfTheWeek,
        end: addDays(startOfTheWeek, weekDaysAmount),
    }).map((day) => {
        const [earliestHours, earliestMinutes] = weeklySchedule.extremities.earliestStart;
        const [latestHours, latestMinutes] = weeklySchedule.extremities.latestEnd;
        const earliestStart = setMinutes(setHours(day, earliestHours), earliestMinutes);
        const latestEnd = setMinutes(setHours(day, latestHours), latestMinutes);

        return {
            date: day,
            isToday: isToday(day),
            name: format(day, "EEEE", {locale}),
            shortName: format(day, "EEE", {locale}),
            dayOfMonth: format(day, "d", {locale}),
            dayOfMonthWithZero: format(day, "dd", {locale}),
            dayOfMonthWithSuffix: format(day, "do", {locale}),
            disabled: disabledDay ? disabledDay(day) : false,
            cells: eachMinuteOfInterval(
                {
                    start: earliestStart,
                    end: latestEnd,
                },
                {
                    step: minuteStep,
                }
            ).toSpliced(-1, 1).map((hour) => ({
                date: hour,
                hour: format(hour, "HH", {locale}),
                minute: format(hour, "mm", {locale}),
                hourAndMinute: format(hour, "HH:mm", {locale}),
                window: windowCell ? windowCell(hour) : false,
                disabled: disabledCell ? disabledCell(hour) : false,
            })),
        }
    });

    const isAllSameYear = isSameYear(days[0].date, days[days.length - 1].date);
    const isAllSameMonth = isSameMonth(days[0].date, days[days.length - 1].date);

    let viewTitle = '';
    if (isAllSameMonth) viewTitle = format(days[0].date, "MMMM yyyy", {locale});
    else if (isAllSameYear)
        viewTitle = `${format(days[0].date, "MMM", {locale})} - ${format(
            days[days.length - 1].date,
            "MMM",
            {locale}
        )} ${format(days[0].date, "yyyy", {locale})}`;
    else
        viewTitle = `${format(days[0].date, "MMM yyyy", {locale})} - ${format(
            days[days.length - 1].date,
            "MMM yyyy",
            {locale}
        )}`;

    const weekNumber = format(days[0].date, "w", {locale});

    return {
        startOfTheWeek,
        isNextWeekDisabled,
        isPreviousWeekDisabled,
        showNextWeek,
        showPreviousWeek,
        goToToday,
        days,
        weekNumber,
        viewTitle,
    };
}

export type Days = ReturnType<typeof useWeekView>["days"];
export type Cell = Days[number]["cells"][number];
