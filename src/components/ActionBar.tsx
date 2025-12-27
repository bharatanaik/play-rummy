interface ActionBarProps {
    isMyTurn: boolean;
    hasDrawn: boolean;
    hasSelectedCard: boolean;
    onDrawClosed: () => void;
    onDrawOpen: () => void;
    onDiscard: () => void;
    onDeclare: () => void;
}

export default function ActionBar({
    isMyTurn,
    hasDrawn,
    hasSelectedCard,
    onDrawClosed,
    onDrawOpen,
    onDiscard,
    onDeclare,
}: ActionBarProps) {
    return (
        <div className="action-bar p-2 safe-area-bottom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 max-w-4xl mx-auto">
                {/* Draw from Closed Pile */}
                <button
                    onClick={onDrawClosed}
                    disabled={!isMyTurn || hasDrawn}
                    className="btn-primary py-2 px-2 text-xs sm:text-sm font-semibold rounded-lg shadow active:scale-95 transition-transform disabled:opacity-50 touch-target"
                >
                    🂠 Closed
                </button>

                {/* Draw from Open Pile */}
                <button
                    onClick={onDrawOpen}
                    disabled={!isMyTurn || hasDrawn}
                    className="btn-secondary py-2 px-2 text-xs sm:text-sm font-semibold rounded-lg shadow active:scale-95 transition-transform disabled:opacity-50 touch-target"
                >
                    🃏 Open
                </button>

                {/* Discard */}
                <button
                    onClick={onDiscard}
                    disabled={!isMyTurn || !hasDrawn || !hasSelectedCard}
                    className="btn-primary py-2 px-2 text-xs sm:text-sm font-semibold rounded-lg shadow active:scale-95 transition-transform disabled:opacity-50 touch-target"
                >
                    ♠️ Discard
                </button>

                {/* Declare */}
                <button
                    onClick={onDeclare}
                    disabled={!isMyTurn || hasDrawn}
                    className="btn-success py-2 px-2 text-xs sm:text-sm font-semibold rounded-lg shadow active:scale-95 transition-transform disabled:opacity-50 touch-target"
                >
                    🏆 Declare
                </button>
            </div>
        </div>
    );
}
