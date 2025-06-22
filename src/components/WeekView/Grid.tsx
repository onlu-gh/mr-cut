import {ReactNode} from "react";
import {getUnixTime} from "date-fns";
import {Cell, Days} from './use-weekview';

export default function Grid({
                                 days,
                                 rowHeight,
                                 CellContent,
                                 onCellClick,
                             }: {
    days: Days;
    rowHeight: number;
    onCellClick?: (cell: Cell) => void;
    CellContent?: (cell: Cell) => ReactNode;
}) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${days[0].cells.length}, minmax(${rowHeight}px, 1fr))`,
            }}>
            {days.map((day, dayIndex) =>
                day.cells.map((cell, cellIndex) => (
                    <button
                        key={getUnixTime(cell.date)}
                        className={`relative border-t border-l border-gray-200 transition-colors cursor-pointer ${cell.window ? 'bg-[#11111166] hover:bg-[#11111188]' : 'hover:bg-[#c9e8ff66]'} disabled:bg-gray-200 disabled:pointer-events-none disabled:border-none`}
                        style={{
                            gridRowStart: cellIndex + 1,
                            gridRowEnd: cellIndex + 2,
                            gridColumnStart: dayIndex + 1,
                            gridColumnEnd: dayIndex + 2,
                        }}
                        disabled={cell.disabled}
                        onClick={() => onCellClick?.(cell)}>
                        {CellContent && CellContent(cell)}
                    </button>
                ))
            )}
            <div className="sticky left-0 grid pointer-events-none"
                 style={{
                     display: "grid",
                     gridRowStart: 1,
                     gridRowEnd: -1,
                     gridColumnStart: 1,
                     gridTemplateRows: `repeat(${days[0].cells.length}, minmax(${rowHeight}px, 1fr))`,
                 }}>
                {days[0].cells.map(
                    (cell, cellIndex) =>
                        // getMinutes(cell.date) === 0 &&
                        (
                            <div key={getUnixTime(cell.date)}
                                 className="relative flex items-center justify-center border-t border-gray-200"
                                 style={{
                                     gridRowStart: cellIndex + 1,
                                     gridRowEnd: cellIndex + 2,
                                 }}>
                                <span className="absolute z-1000 top-0 right-0 text-xs text-slate-400 px-1">
                                    {cell.hourAndMinute}
                                </span>
                            </div>
                        )
                )}
            </div>
        </div>
    );
}