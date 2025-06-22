import {ReactNode} from "react";

export default function Header({
                                   title,
                                   showTodayButton = true,
                                   todayButton,
                                   onReload,
                                   onToday,
                                   disablePrevButton = true,
                                   prevButton,
                                   onPrev,
                                   disableNextButton = true,
                                   nextButton,
                                   onNext,
                               }: {
    title: ReactNode;
    showTodayButton?: boolean;
    todayButton?: ({onToday}: { onToday?: () => void }) => ReactNode;
    onReload?: () => void;
    onToday?: () => void;
    disablePrevButton?: boolean;
    prevButton?: ({onPrev, disabled}: { onPrev?: () => void, disabled: boolean }) => ReactNode;
    onPrev?: () => void;
    disableNextButton?: boolean;
    nextButton?: ({onNext, disabled}: { onNext?: () => void, disabled: boolean }) => ReactNode;
    onNext?: () => void;
}) {
    return (
        <header className="flex items-center justify-between bg-slate-50 border-b-[#394f4455] border-b-1 px-6 py-4 h-16">
            <button
                className="inline-flex ml-5 items-center justify-center text-xs transition-colors font-normal border border-slate-200 bg-white hover:bg-slate-50 hover:cursor-pointer h-8 rounded-md px-3"
                onClick={onReload}>
                רענן
            </button>
            <h1 className="flex absolute left-[50%] translate-x-[-50%] items-center gap-3 text-base font-semibold text-slate-600">
                {title}
            </h1>
            <div className="flex">
                {showTodayButton &&
                    (todayButton ? (
                        todayButton({onToday})
                    ) : (
                        <button
                            className="inline-flex mr-auto ml-5 items-center justify-center text-xs text-white transition-colors font-normal border border-slate-200 bg-[#2D5043] hover:bg-[#2D5043cc] hover:cursor-pointer h-8 rounded-md px-3"
                            onClick={onToday}
                        >
                            חזרה לשבוע הנוכחי
                        </button>
                    ))}
                <div className="flex items-center space-x-5">
                    <div className="flex space-x-1">
                        {
                            (prevButton ? (
                                prevButton({onPrev, disabled: disablePrevButton})
                            ) : (
                                <button
                                    disabled={disablePrevButton}
                                    className="inline-flex items-center justify-center text-xs transition-colors font-normal border border-slate-200 bg-white hover:bg-slate-50 hover:cursor-pointer disabled:bg-slate-100 disabled:opacity-50 disabled:cursor-default h-8 w-8 rounded-md"
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
                            ))
                        }
                        {
                            (nextButton ? (
                                nextButton({onNext, disabled: disableNextButton})
                            ) : (
                                <button
                                    disabled={disableNextButton}
                                    className="inline-flex items-center justify-center text-xs transition-colors font-normal border border-slate-200 bg-white hover:bg-slate-50 hover:cursor-pointer disabled:bg-slate-100 disabled:opacity-50 disabled:cursor-default h-8 w-8 rounded-md"
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
            </div>
        </header>
    );
}
