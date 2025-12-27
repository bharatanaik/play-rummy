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
        <div className="action-bar p-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-4xl mx-auto">
                {/* Draw from Closed Pile */}
                <button
                    onClick={onDrawClosed}
                    disabled={!isMyTurn || hasDrawn}
                    className="btn-primary touch-target text-sm md:text-base"
                >
                    🂠 Draw Closed
                </button>

                {/* Draw from Open Pile */}
                <button
                    onClick={onDrawOpen}
                    disabled={!isMyTurn || hasDrawn}
                    className="btn-secondary touch-target text-sm md:text-base"
                >
                    🃏 Draw Open
                </button>

                {/* Discard */}
                <button
                    onClick={onDiscard}
                    disabled={!isMyTurn || !hasDrawn || !hasSelectedCard}
                    className="btn-primary touch-target text-sm md:text-base"
                >
                    ♠️ Discard
                </button>

                {/* Declare */}
                <button
                    onClick={onDeclare}
                    disabled={!isMyTurn || hasDrawn}
                    className="btn-success touch-target text-sm md:text-base"
                >
                    🏆 Declare
                </button>
            </div>
        </div>
    );
}
