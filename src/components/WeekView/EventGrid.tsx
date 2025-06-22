import {Day, getDay, getHours, getMinutes, isSameWeek, Locale,} from "date-fns";
import {Days} from './use-weekview';
import {Event} from './WeekView';

export default function EventGrid({
                                      days,
                                      events,
                                      weekStartsOn,
                                      minuteStep,
                                      rowHeight,
                                      onEventClick,
                                  }: {
    days: Days;
    events?: Event[];
    weekStartsOn: Day;
    locale?: Locale;
    minuteStep: number;
    rowHeight: number;
    onEventClick?: (event: Event) => void;
}) {
    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${days[0].cells.length}, minmax(${rowHeight}px, 1fr))`,
        }}>
            {(events || [])
                .filter((event) => isSameWeek(days[0].date, event.startDate))
                .map((event) => {
                    const start =
                        (getHours(event.startDate) - Number(days[0].cells[0].hour)) * 2 +
                        Math.floor(getMinutes(event.startDate) / minuteStep);
                    const end =
                        (getHours(event.endDate) - Number(days[0].cells[0].hour)) * 2 +
                        Math.ceil(getMinutes(event.endDate) / minuteStep);

                    const paddingTop =
                        ((getMinutes(event.startDate) % minuteStep) / minuteStep) *
                        rowHeight;

                    const paddingBottom =
                        (rowHeight -
                            ((getMinutes(event.endDate) % minuteStep) / minuteStep) *
                            rowHeight) %
                        rowHeight;

                    const eventHeight = rowHeight - (paddingTop + paddingBottom);

                    return (
                        <div key={event.id}
                             className="relative flex transition-all"
                             style={{
                                 gridRowStart: start,
                                 gridRowEnd: end,
                                 gridColumnStart: getDay(event.startDate) - weekStartsOn + 1,
                                 gridColumnEnd: "span 1",
                             }}
                        >
                              <span
                                  className={`absolute inset-0 flex flex-col justify-center items-center rounded-md text-sm leading-none m-[2px] ml-[2.75px] box-border bg-[#B87333] hover:bg-[#c8894c] transition cursor-pointer`}
                                  style={{
                                      height: eventHeight - 4,
                                  }}
                                  onClick={() => onEventClick?.(event)}>
                                    {/*{*/}
                                    {/*    eventLength >= minuteStep && (*/}
                                    {/*        <p className="text-white leading-4 text-sm">*/}
                                    {/*            {format(new Date(event.startDate), "H:mm", {*/}
                                    {/*                weekStartsOn,*/}
                                    {/*                locale,*/}
                                    {/*            })}*/}
                                    {/*            -*/}
                                    {/*            {format(new Date(event.endDate), "H:mm", {*/}
                                    {/*                weekStartsOn,*/}
                                    {/*                locale,*/}
                                    {/*            })}*/}
                                    {/*        </p>*/}
                                    {/*    )*/}
                                    {/*}*/}
                                  <p className={`font-semibold w-[100%] text-white line text-center line-clamp-${Math.floor(eventHeight/rowHeight * 3)} overflow-ellipsis`}>{event.title}</p>
                              </span>
                        </div>
                    );
                })}
        </div>
    );
}
