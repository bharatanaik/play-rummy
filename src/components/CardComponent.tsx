import type { Card } from "../model";

function CardComponent ({id, suit, rank}: Card) {
    return (
        <>
            <p>{id}, {suit}, {rank}</p>   
        </>
    )
}

export default CardComponent;