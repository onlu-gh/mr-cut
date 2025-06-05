import {ReactNode} from "react";
import {MenuItem, Select} from '@mui/material';
import {Barber} from '@/entities/Barber';

export default function Header({
                                   selectedBarberId,
                                   barbers,
                                   onBarberChange,
                                   title,
                                   showTodayButton = true,
                                   todayButton,
                                   onToday,
                                   showPrevButton = true,
                                   prevButton,
                                   onPrev,
                                   showNextButton = true,
                                   nextButton,
                                   onNext,
                               }: {
    selectedBarberId?: string;
    barbers?: Barber[];
    onBarberChange?: (barber: Barber) => void;
    title: ReactNode;
    showTodayButton?: boolean;
    todayButton?: ({onToday}: { onToday?: () => void }) => ReactNode;
    onToday?: () => void;
    showPrevButton?: boolean;
    prevButton?: ({onPrev}: { onPrev?: () => void }) => ReactNode;
    onPrev?: () => void;
    showNextButton?: boolean;
    nextButton?: ({onNext}: { onNext?: () => void }) => ReactNode;
    onNext?: () => void;
}) {
    return (
        <header className="flex items-center justify-between bg-slate-50 border-b px-6 py-4 h-16">
            {
                barbers &&
                <div className={"ml-10 w-[150px]"}>
                    <Select fullWidth className={"h-[32px]!important"}
                            sx={{
                                "& .MuiInputBase-input": {
                                    padding: '4.5px !important',
                                },
                                "& .MuiSelect-select.MuiSelect-outlined": {
                                    paddingLeft: '32px !important',
                                    paddingRight: '14px !important',
                                },
                                "& .MuiSvgIcon-root": {
                                    right: "unset",
                                    left: "7px",
                                },
                            }}
                            value={selectedBarberId}
                            onChange={(e) => onBarberChange(barbers.find((b) => b.id === e.target.value))}>
                        {barbers.map((b) => <MenuItem key={b.id}
                                                      value={b.id}>{`${b.firstName} ${b.lastName}`}</MenuItem>)}
                    </Select>
                </div>
            }
            <h1 className="flex absolute left-[50%] translate-x-[-50%] items-center gap-3 text-base font-semibold text-slate-600">
                {title}
            </h1>
            {showTodayButton &&
                (todayButton ? (
                    todayButton({onToday})
                ) : (
                    <button
                        className="inline-flex mr-auto ml-5 items-center justify-center text-xs transition-colors font-normal border border-slate-200 bg-white hover:bg-slate-50 h-8 rounded-md px-3"
                        onClick={onToday}
                    >
                        חזרה להיום
                    </button>
                ))}
            <div className="flex items-center space-x-5">
                <div className="flex space-x-1">
                    {showPrevButton &&
                        (prevButton ? (
                            prevButton({onPrev})
                        ) : (
                            <button
                                className="inline-flex items-center justify-center text-xs transition-colors font-normal border border-slate-200 bg-white hover:bg-slate-50 h-8 w-8 rounded-md"
                                onClick={onPrev}
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 15 15"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z"
                                        fill="currentColor"
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                    ></path>
                                </svg>
                            </button>
                        ))}
                    {showNextButton &&
                        (nextButton ? (
                            nextButton({onNext})
                        ) : (
                            <button
                                className="inline-flex items-center justify-center text-xs transition-colors font-normal border border-slate-200 bg-white hover:bg-slate-50 h-8 w-8 rounded-md"
                                onClick={onNext}
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 15 15"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z"
                                        fill="currentColor"
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                    ></path>
                                </svg>
                            </button>
                        ))}
                </div>
            </div>
        </header>
    );
}
