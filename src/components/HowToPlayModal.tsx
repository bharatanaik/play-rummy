interface HowToPlayModalProps {
    onClose: () => void;
}

export default function HowToPlayModal({ onClose }: HowToPlayModalProps) {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold">How to Play Rummy</h2>
                            <p className="text-blue-100 text-sm">Indian Rummy Rules</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                        >
                            <span className="text-3xl">×</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Objective */}
                    <section>
                        <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span>🎯</span>
                            <span>Objective</span>
                        </h3>
                        <p className="text-gray-700">
                            Be the first player to form valid sequences and sets with all 13 cards and declare your hand.
                        </p>
                    </section>

                    {/* Game Setup */}
                    <section>
                        <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span>🎴</span>
                            <span>Game Setup</span>
                        </h3>
                        <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">•</span>
                                <span>Each player receives 13 cards from a standard deck</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">•</span>
                                <span>One card is randomly selected as the wild joker</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">•</span>
                                <span>The remaining cards form the closed pile (face down)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">•</span>
                                <span>Discarded cards go to the open pile (face up)</span>
                            </li>
                        </ul>
                    </section>

                    {/* How to Play */}
                    <section>
                        <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span>🎮</span>
                            <span>How to Play</span>
                        </h3>
                        <ol className="space-y-2 text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-blue-600">1.</span>
                                <span>On your turn, draw one card from either the closed pile or open pile</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-blue-600">2.</span>
                                <span>Arrange your cards into valid sequences and sets</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-blue-600">3.</span>
                                <span>Discard one card to the open pile to end your turn</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-blue-600">4.</span>
                                <span>When you have a valid hand, declare to win!</span>
                            </li>
                        </ol>
                    </section>

                    {/* Valid Combinations */}
                    <section>
                        <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span>✨</span>
                            <span>Valid Combinations</span>
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                                <h4 className="font-bold text-green-900 mb-2">Pure Sequence</h4>
                                <p className="text-sm text-gray-700 mb-2">
                                    3 or more consecutive cards of the same suit, NO jokers allowed
                                </p>
                                <div className="bg-white rounded p-2 font-mono text-sm">
                                    Example: 4♥ 5♥ 6♥ 7♥
                                </div>
                            </div>

                            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                <h4 className="font-bold text-blue-900 mb-2">Sequence (Impure)</h4>
                                <p className="text-sm text-gray-700 mb-2">
                                    3 or more consecutive cards of the same suit, jokers can be used
                                </p>
                                <div className="bg-white rounded p-2 font-mono text-sm">
                                    Example: 4♠ 🃏 6♠ 7♠ (joker as 5♠)
                                </div>
                            </div>

                            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                                <h4 className="font-bold text-purple-900 mb-2">Set</h4>
                                <p className="text-sm text-gray-700 mb-2">
                                    3 or 4 cards of the same rank but different suits
                                </p>
                                <div className="bg-white rounded p-2 font-mono text-sm">
                                    Example: 9♥ 9♠ 9♣
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Declaration Requirements */}
                    <section>
                        <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span>🏆</span>
                            <span>Declaration Requirements</span>
                        </h3>
                        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                            <p className="text-sm font-semibold text-yellow-900 mb-2">To declare, you must have:</p>
                            <ul className="space-y-1 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-yellow-600">✓</span>
                                    <span>At least 1 pure sequence (mandatory!)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-yellow-600">✓</span>
                                    <span>At least 2 sequences in total</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-yellow-600">✓</span>
                                    <span>All 13 cards grouped into valid sets/sequences</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Scoring */}
                    <section>
                        <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span>📊</span>
                            <span>Scoring</span>
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-green-600">Winner:</span>
                                <span>0 points (with valid declaration)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-red-600">Losers:</span>
                                <span>Sum of points of ungrouped cards (deadwood)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-orange-600">First Drop:</span>
                                <span>20 points penalty</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-orange-600">Middle Drop:</span>
                                <span>40 points penalty</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-red-600">Invalid Declaration:</span>
                                <span>80 points penalty</span>
                            </li>
                        </ul>
                        <div className="mt-3 p-3 bg-gray-100 rounded text-sm">
                            <p className="font-semibold text-gray-800 mb-1">Card Values:</p>
                            <p className="text-gray-700">
                                • Ace, Jack, Queen, King = 10 points each<br />
                                • Number cards = Face value (2-10)<br />
                                • Jokers = 0 points
                            </p>
                        </div>
                    </section>

                    {/* Tips */}
                    <section>
                        <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span>💡</span>
                            <span>Pro Tips</span>
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                <span>Always prioritize forming a pure sequence first</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                <span>Discard high-value cards early if they don't fit your sequences</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                <span>Keep track of cards discarded by opponents</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                <span>Use jokers wisely to complete impure sequences or sets</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                <span>Don't rush to declare - verify your hand is valid!</span>
                            </li>
                        </ul>
                    </section>

                    {/* Close Button */}
                    <div className="pt-4 border-t">
                        <button
                            onClick={onClose}
                            className="w-full btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg font-bold rounded-lg"
                        >
                            Got it! Let's Play 🎮
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
