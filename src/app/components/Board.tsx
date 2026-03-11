import '../styles/board.css'

export default function Board(){
    const horizontalAxis : string[] = ['a','b','c','d','e','f','g','h']
    const verticalAxis : string[] = ['1','2','3','4','5','6','7','8']

    const board = [];
    for (let i = horizontalAxis.length-1; i >= 0 ; i--){
        for (let j = verticalAxis.length-1; j >= 0 ; j--){
            const number = j + i + 2;
            if (number % 2 === 0 ){
                board.push(<div className='white-tiles' key={horizontalAxis[i]+verticalAxis[j]}></div>)
            } else {
                board.push(<div className='black-tiles' key={horizontalAxis[i]+horizontalAxis[j]}></div>)
            }
        }
    }
    return(
        <div className='board'>
            {board}
        </div>
    )
}