import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button className={props.className} onClick={props.onClick}>
            { props.value }
        </button>
    );
}

class Board extends React.Component {
    createBoard(winningSquares) {
        let rows = [];
        for (let i = 0; i < 9; i += 3) {
            let childrens = [];
            for (let j = 0; j < 3; j++) {
                let index = i + j;
                const winning = winningSquares.includes(index);
                childrens.push(this.renderSquare(index, winning));
            }
            rows.push(<div key={i} className="board-row">{childrens}</div>);
        }
        return rows;
    }

    renderSquare(i, winning=false) {
        return (
            <Square key={i}
                className={winning ? 'square winning-square' : 'square'}
                value={this.props.squares[i]} 
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        return (
            <div>
                {this.createBoard(this.props.winningSquares)}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
            }],
            stepNumber: 0,
            xIsNext: true,
        };
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step %2) === 0,
        });
    }

    sortMoves() {
        const firstHistory = this.state.history.slice(0, 1);
        const history = this.state.history.slice(1, this.state.history.length);
        this.setState({
            history: firstHistory.concat(history.reverse()),
        });
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const result = calculateWinner(squares);
        if (result || squares[i] || !squares.includes(null)) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        let row, col;
        row = Math.floor(i / 3);
        col = i % 3;
        this.setState({
            history: history.concat([{
                squares: squares,
                location: {
                    row: row,
                    col: col,
                }
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const result = calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            const description = move && history[move].location ?
                'Go to move ' + move + ' (' + history[move].location.row + ', ' + history[move].location.col + ')':
                'Go to game start';
            return (
                <li key={move}>
                    <button className={move === this.state.stepNumber ? 'bold-button' : null} onClick={() => this.jumpTo(move)}>
                        {description}
                    </button>
                </li>
            );
        });

        let status;
        let winningSquares = [];
        if (result && result.symbol) {
            status = 'Winner: ' + result.symbol;
            winningSquares = result.winningSquares;
        }
        else if(this.state.stepNumber === 9) {
            status = 'Match tied';
        }
        else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board 
                        squares={current.squares}
                        winningSquares={winningSquares}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    
                <button 
                    onClick={() => this.sortMoves()}>
                    Sort Moves
                </button>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}


function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    let result = null;

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            result = {
                symbol: squares[a],
                winningSquares: [a, b, c],
            }
            break;
        }
    }
    return result; 
}


ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
