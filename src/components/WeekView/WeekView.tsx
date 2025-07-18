import {Day, isSameWeek, Locale} from "date-fns";

import useWeekView, {Cell, WorkingHours} from "./use-weekview";
import Header from "./Header";
import DaysHeader from "./DaysHeader";
import Grid from "./Grid";
import EventGrid from "./EventGrid";
import React, {useEffect} from 'react';
import {CircularProgress} from '@mui/material';

export type Event = {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
};

export default function WeekView({
                                     isMobile,
                                     isLoadingCalendar,
                                     onStartOfWeekChange,
                                     initialDate,
                                     getWeeklySchedule,
                                     minuteStep = 30,
                                     weekStartsOn = 0,
                                     locale,
                                     rowHeight = 56,
                                     windowCell,
                                     disabledCell,
                                     disabledDay,
                                     disabledWeek,
                                     events,
                                     onReload,
                                     onCellClick,
                                     onEventClick,
                                     onDayClick,
                                 }: {
    isMobile?: boolean;
    isLoadingCalendar?: boolean;
    onStartOfWeekChange?: (startOfTheWeek: Date) => void,
    initialDate?: Date;
    getWeeklySchedule?: (startDayOfWeek: Date) => WorkingHours[];
    minuteStep?: number;
    weekStartsOn?: Day;
    locale?: Locale;
    rowHeight?: number;
    windowCell?: (date: Date) => boolean;
    disabledCell?: (date: Date) => boolean;
    disabledDay?: (date: Date) => boolean;
    disabledWeek?: (startDayOfWeek: Date) => boolean;
    events?: Event[];
    onReload?: () => void,
    onCellClick?: (cell: Cell) => void;
    onEventClick?: (event: Event) => void;
    onDayClick?: (date: Date) => void;
}) {
    const {
        startOfTheWeek,
        days: sevenDays,
        isNextWeekDisabled,
        isPreviousWeekDisabled,
        showNextWeek,
        showPreviousWeek,
        goToToday,
        viewTitle
    } = useWeekView({
        initialDate,
        getWeeklySchedule,
        minuteStep,
        weekStartsOn,
        locale,
        windowCell,
        disabledCell,
        disabledDay,
        disabledWeek,
    });

    useEffect(() => {
        onStartOfWeekChange?.(startOfTheWeek);
    }, [startOfTheWeek, onStartOfWeekChange]);

    const days = sevenDays.toSpliced(-1, 1);

    return (
        <div className="flex flex-col overflow-hidden bg-white rounded-md border-[#394f4455] border-1">
            <Header
                title={isMobile ? '' : viewTitle}
                onReload={onReload}
                disableNextButton={isNextWeekDisabled}
                disablePrevButton={isPreviousWeekDisabled}
                onNext={showNextWeek}
                onPrev={showPreviousWeek}
                onToday={goToToday}
                showTodayButton={!isSameWeek(days[0].date, new Date())}
            />
            {
                isMobile &&
                <h1 className="bg-slate-50 flex items-center justify-center p-2 text-base font-semibold text-slate-600">
                    {viewTitle}
                </h1>
            }
            <DaysHeader days={days} onDayClick={onDayClick}/>
            <div className={`flex flex-col flex-1 overflow-hidden select-none bg-white ${isLoadingCalendar && 'brightness-90 pointer-events-none'}`}>
                <div className="flex flex-col flex-1 isolate overflow-auto" dir={"ltr"}>
                    <div className="flex flex-col flex-none" dir={"rtl"}>
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
                {
                    isLoadingCalendar && <CircularProgress color={'success'}
                                                           thickness={5}
                                                           className="z-50 absolute top-[50%] translate-y-[-100%] self-center"/>
                }
            </div>
        </div>
    );
}
