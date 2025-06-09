import {Day, isSameWeek, Locale} from "date-fns";

import useWeekView, {Cell, WorkingHours} from "./use-weekview";
import Header from "./Header";
import DaysHeader from "./DaysHeader";
import Grid from "./Grid";
import EventGrid from "./EventGrid";
import {Barber} from "@/entities/Barber";
import {useEffect} from 'react';

export type Event = {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
};

export default function WeekView({
                                     selectedBarberId,
                                     onStartOfWeekChange,
                                     barbers,
                                     onBarberChange,
                                     initialDate,
                                     getWeeklySchedule,
                                     minuteStep = 30,
                                     weekStartsOn = 1,
                                     locale,
                                     rowHeight = 56,
                                     disabledCell,
                                     disabledDay,
                                     disabledWeek,
                                     events,
                                     onReload,
                                     onCellClick,
                                     onEventClick,
                                 }: {
    selectedBarberId?: string;
    onStartOfWeekChange?: (startOfTheWeek: Date) => void,
    barbers?: Barber[];
    onBarberChange?: (barber: Barber) => void;
    initialDate?: Date;
    getWeeklySchedule?: (startDayOfWeek: Date) => WorkingHours[];
    minuteStep?: number;
    weekStartsOn?: Day;
    locale?: Locale;
    rowHeight?: number;
    disabledCell?: (date: Date) => boolean;
    disabledDay?: (date: Date) => boolean;
    disabledWeek?: (startDayOfWeek: Date) => boolean;
    events?: Event[];
    onReload?: () => void,
    onCellClick?: (cell: Cell) => void;
    onEventClick?: (event: Event) => void;
}) {
    const {startOfTheWeek, days: sevenDays, nextWeek, previousWeek, goToToday, viewTitle} = useWeekView({
        initialDate,
        getWeeklySchedule,
        minuteStep,
        weekStartsOn,
        locale,
        disabledCell,
        disabledDay,
        disabledWeek,
    });

    useEffect(() => {
        onStartOfWeekChange?.(startOfTheWeek);
    }, [startOfTheWeek, onStartOfWeekChange]);

    const days = sevenDays.toSpliced(-1, 1);

    return (
        <div className="flex flex-col overflow-hidden bg-white h-[70vh] rounded-md border-[#394f4455] border-1">
            <Header
                selectedBarberId={selectedBarberId}
                onBarberChange={onBarberChange}
                barbers={barbers}
                title={viewTitle}
                onReload={onReload}
                onNext={nextWeek}
                onPrev={previousWeek}
                onToday={goToToday}
                showTodayButton={!isSameWeek(days[0].date, new Date())}
            />
            <div className="flex flex-col flex-1 overflow-hidden select-none">
                <div className="flex flex-col flex-1 isolate overflow-auto" dir={"ltr"}>
                    <div className="flex flex-col flex-none" dir={"rtl"}>
                        <DaysHeader days={days}/>
                        <div className="grid grid-cols-1 grid-rows-1 flex-1">
                            <div className="row-start-1 col-start-1">
                                <Grid
                                    days={days}
                                    rowHeight={rowHeight}
                                    onCellClick={onCellClick}
                                />
                            </div>
                            <div className="row-start-1 col-start-1">
                                <EventGrid
                                    days={days}
                                    events={events}
                                    weekStartsOn={weekStartsOn}
                                    locale={locale}
                                    minuteStep={minuteStep}
                                    rowHeight={rowHeight}
                                    onEventClick={onEventClick}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
