import { useState, useCallback, useEffect } from 'react';
import type { Card, Meld, MeldType } from '../model';
import { validationService } from '../services/validation.service';
import CardComponent from './Card';

interface DeclareModalProps {
    hand: Card[];
    onDeclare: (melds: Meld[]) => void;
    onClose: () => void;
}

export default function DeclareModal({ hand, onDeclare, onClose }: DeclareModalProps) {
    const [melds, setMelds] = useState<Meld[]>([]);
    const [unassignedCards, setUnassignedCards] = useState<Card[]>(hand);
    const [draggedCard, setDraggedCard] = useState<{ card: Card; source: 'unassigned' | number } | null>(null);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // Initialize with empty melds
    useEffect(() => {
        setUnassignedCards(hand);
    }, [hand]);

    // Validate current melds
    const validateMelds = useCallback(() => {
        const errors: string[] = [];
        let hasValidPureSequence = false;
        let sequenceCount = 0;

        melds.forEach((meld, index) => {
            let isValid = false;
            
            if (meld.type === 'pure-sequence') {
                isValid = validationService.validatePureSequence(meld.cards);
                if (isValid) {
                    hasValidPureSequence = true;
                    sequenceCount++;
                }
            } else if (meld.type === 'sequence') {
                isValid = validationService.validateSequence(meld.cards);
                if (isValid) sequenceCount++;
            } else if (meld.type === 'set') {
                isValid = validationService.validateSet(meld.cards);
            }

            if (!isValid && meld.cards.length > 0) {
                errors.push(`Meld ${index + 1} is invalid`);
            }
        });

        if (!hasValidPureSequence && melds.some(m => m.cards.length > 0)) {
            errors.push('Need at least 1 pure sequence');
        }

        if (sequenceCount < 2 && melds.some(m => m.cards.length > 0)) {
            errors.push('Need at least 2 sequences total');
        }

        if (unassignedCards.length > 0) {
            errors.push('All 13 cards must be assigned to melds');
        }

        setValidationErrors(errors);
        return errors.length === 0;
    }, [melds, unassignedCards]);

    useEffect(() => {
        validateMelds();
    }, [validateMelds]);

    const addMeld = (type: MeldType) => {
        setMelds([...melds, { type, cards: [] }]);
    };

    const removeMeld = (index: number) => {
        const meld = melds[index];
        setUnassignedCards([...unassignedCards, ...meld.cards]);
        setMelds(melds.filter((_, i) => i !== index));
    };

    const handleDragStart = (card: Card, source: 'unassigned' | number) => {
        setDraggedCard({ card, source });
    };

    const handleDragEnd = () => {
        setDraggedCard(null);
    };

    const handleDropToMeld = (meldIndex: number) => {
        if (!draggedCard) return;

        const { card, source } = draggedCard;

        // Remove from source
        if (source === 'unassigned') {
            setUnassignedCards(unassignedCards.filter(c => c.id !== card.id));
        } else {
            const updatedMelds = [...melds];
            updatedMelds[source].cards = updatedMelds[source].cards.filter(c => c.id !== card.id);
            setMelds(updatedMelds);
        }

        // Add to destination
        const updatedMelds = [...melds];
        updatedMelds[meldIndex].cards.push(card);
        setMelds(updatedMelds);

        setDraggedCard(null);
    };

    const handleDropToUnassigned = () => {
        if (!draggedCard) return;

        const { card, source } = draggedCard;

        if (source !== 'unassigned') {
            const updatedMelds = [...melds];
            updatedMelds[source].cards = updatedMelds[source].cards.filter(c => c.id !== card.id);
            setMelds(updatedMelds);
            setUnassignedCards([...unassignedCards, card]);
        }

        setDraggedCard(null);
    };

    const handleDeclare = () => {
        if (validateMelds()) {
            onDeclare(melds.filter(m => m.cards.length > 0));
        }
    };

    const getMeldValidationClass = (meld: Meld) => {
        if (meld.cards.length === 0) return 'border-gray-300';
        
        let isValid = false;
        if (meld.type === 'pure-sequence') {
            isValid = validationService.validatePureSequence(meld.cards);
        } else if (meld.type === 'sequence') {
            isValid = validationService.validateSequence(meld.cards);
        } else if (meld.type === 'set') {
            isValid = validationService.validateSet(meld.cards);
        }

        return isValid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50';
    };

    const canDeclare = validationErrors.length === 0 && unassignedCards.length === 0;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold">Declare Your Hand</h2>
                            <p className="text-green-100 text-sm md:text-base">Organize cards into valid sequences and sets</p>
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
                    {/* Validation Status */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                        <h3 className="font-bold text-blue-900 mb-2">Declaration Requirements:</h3>
                        <div className="space-y-1 text-sm">
                            <div className={`flex items-center gap-2 ${melds.some(m => m.type === 'pure-sequence' && validationService.validatePureSequence(m.cards)) ? 'text-green-700' : 'text-gray-600'}`}>
                                <span>{melds.some(m => m.type === 'pure-sequence' && validationService.validatePureSequence(m.cards)) ? '✓' : '○'}</span>
                                <span>At least 1 pure sequence (no jokers)</span>
                            </div>
                            <div className={`flex items-center gap-2 ${melds.filter(m => (m.type === 'sequence' || m.type === 'pure-sequence') && (validationService.validateSequence(m.cards) || validationService.validatePureSequence(m.cards))).length >= 2 ? 'text-green-700' : 'text-gray-600'}`}>
                                <span>{melds.filter(m => (m.type === 'sequence' || m.type === 'pure-sequence') && (validationService.validateSequence(m.cards) || validationService.validatePureSequence(m.cards))).length >= 2 ? '✓' : '○'}</span>
                                <span>At least 2 sequences total</span>
                            </div>
                            <div className={`flex items-center gap-2 ${unassignedCards.length === 0 ? 'text-green-700' : 'text-gray-600'}`}>
                                <span>{unassignedCards.length === 0 ? '✓' : '○'}</span>
                                <span>All 13 cards assigned to melds</span>
                            </div>
                        </div>
                        {validationErrors.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-blue-300">
                                <p className="text-red-600 font-semibold text-sm">Errors:</p>
                                {validationErrors.map((error, i) => (
                                    <p key={i} className="text-red-600 text-sm">• {error}</p>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Unassigned Cards */}
                    <div>
                        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span>Unassigned Cards</span>
                            <span className="text-sm font-normal text-gray-600">({unassignedCards.length})</span>
                        </h3>
                        <div
                            className="min-h-[100px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-wrap gap-2"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDropToUnassigned}
                        >
                            {unassignedCards.length === 0 ? (
                                <p className="text-gray-400 text-sm w-full text-center py-4">All cards assigned to melds</p>
                            ) : (
                                unassignedCards.map((card) => (
                                    <div
                                        key={card.id}
                                        draggable
                                        onDragStart={() => handleDragStart(card, 'unassigned')}
                                        onDragEnd={handleDragEnd}
                                        className="cursor-move"
                                    >
                                        <CardComponent {...card} size="small" draggable />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Melds */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-gray-800">Your Melds</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => addMeld('pure-sequence')}
                                    className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                >
                                    + Pure Sequence
                                </button>
                                <button
                                    onClick={() => addMeld('sequence')}
                                    className="btn btn-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                                >
                                    + Sequence
                                </button>
                                <button
                                    onClick={() => addMeld('set')}
                                    className="btn btn-sm bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
                                >
                                    + Set
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {melds.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-8 bg-gray-50 rounded-lg">
                                    Add sequences and sets using the buttons above
                                </p>
                            ) : (
                                melds.map((meld, index) => (
                                    <div
                                        key={index}
                                        className={`border-2 rounded-lg p-4 ${getMeldValidationClass(meld)}`}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={() => handleDropToMeld(index)}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold text-sm capitalize">
                                                {meld.type.replace('-', ' ')} ({meld.cards.length} cards)
                                            </span>
                                            <button
                                                onClick={() => removeMeld(index)}
                                                className="text-red-500 hover:text-red-700 font-bold text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {meld.cards.length === 0 ? (
                                                <p className="text-gray-400 text-sm py-4">Drop cards here</p>
                                            ) : (
                                                meld.cards.map((card) => (
                                                    <div
                                                        key={card.id}
                                                        draggable
                                                        onDragStart={() => handleDragStart(card, index)}
                                                        onDragEnd={handleDragEnd}
                                                        className="cursor-move"
                                                    >
                                                        <CardComponent {...card} size="small" draggable />
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            onClick={onClose}
                            className="flex-1 btn btn-secondary px-6 py-3 text-lg font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeclare}
                            disabled={!canDeclare}
                            className={`
                                flex-1 btn px-6 py-3 text-lg font-bold
                                ${canDeclare 
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }
                            `}
                        >
                            {canDeclare ? '🎯 Declare!' : 'Fix Errors to Declare'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
