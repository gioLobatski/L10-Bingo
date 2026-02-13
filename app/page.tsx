"use client";
import { useState, useEffect, useRef } from "react";

const MAX_NUMBER = 75;

const getLetter = (num: number): string => {
  if (num <= 15) return "B";
  if (num <= 30) return "I";
  if (num <= 45) return "N";
  if (num <= 60) return "G";
  return "O";
};

const bingoColumns: Record<string, number[]> = {
  B: Array.from({ length: 15 }, (_, i) => i + 1),
  I: Array.from({ length: 15 }, (_, i) => i + 16),
  N: Array.from({ length: 15 }, (_, i) => i + 31),
  G: Array.from({ length: 15 }, (_, i) => i + 46),
  O: Array.from({ length: 15 }, (_, i) => i + 61),
};

export default function Home() {
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [finalNumber, setFinalNumber] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [drawn, setDrawn] = useState<number[]>([]);

  const rollAudio = useRef<HTMLAudioElement | null>(null);
  const drawAudio = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const drawTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    rollAudio.current = new Audio("/sounds/roulette.mp3");
    if (rollAudio.current) rollAudio.current.loop = true;

    drawAudio.current = new Audio("/sounds/draw.mp3");
  }, []);

  const startRoulette = () => {
    if (drawn.length >= MAX_NUMBER) return;

    setIsRolling(true);
    setFinalNumber(null);

    rollAudio.current?.play();

    intervalRef.current = setInterval(() => {
      setCurrentNumber(Math.floor(Math.random() * MAX_NUMBER) + 1);
    }, 70);

    // AUTO STOP AFTER 4 SECONDS
    setTimeout(stopRoulette, 4000);
  };

  const stopRoulette = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current as unknown as number);
      intervalRef.current = null;
    }
    if (rollAudio.current) {
      rollAudio.current.pause();
      rollAudio.current.currentTime = 0;
    }

    let num;
    do {
      num = Math.floor(Math.random() * MAX_NUMBER) + 1;
    } while (drawn.includes(num));

    setCurrentNumber(num);
    setFinalNumber(num);
    setDrawn((prev) => [...prev, num]);

    drawAudio.current?.play();
    setIsRolling(false);
  };
    // play bell then stop it after 3 seconds

    if (drawTimeoutRef.current) {
      clearTimeout(drawTimeoutRef.current as unknown as number);
    }
    drawTimeoutRef.current = setTimeout(() => {
      if (drawAudio.current) {
        drawAudio.current.pause();
        drawAudio.current.currentTime = 0;
      }
      drawTimeoutRef.current = null;
    }, 3000);

  const resetGame = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current as unknown as number);
      intervalRef.current = null;
    }

    rollAudio.current?.pause();
    if (rollAudio.current) rollAudio.current.currentTime = 0;

    setCurrentNumber(null);
    setFinalNumber(null);
    setDrawn([]);
    if (drawTimeoutRef.current) {
      clearTimeout(drawTimeoutRef.current as unknown as number);
      drawTimeoutRef.current = null;
    }
    setIsRolling(false);
  };

  return (
    <main className="container">
      <h1 className="title">Bingo Number Roulette</h1>

      <div className="content">
        {/* LEFT – ROULETTE */}
        <div className="left">
          <div className={`ball ${finalNumber ? "final" : ""}`}>
            {currentNumber ? (
              <>
                <span className="letter">{getLetter(currentNumber)}</span>
                <span className="number">{currentNumber}</span>
              </>
            ) : (
              "--"
            )}
          </div>

          <div className="buttons">
            <button
              className="btn"
              onClick={startRoulette}
              disabled={isRolling || drawn.length >= MAX_NUMBER}
            >
              {isRolling ? "Rolling..." : "Draw Number"}
            </button>

            <button className="btn reset" onClick={resetGame}>
              Reset
            </button>
          </div>
        </div>

        {/* RIGHT – BINGO BOARD */}
        <div className="board">
          {Object.entries(bingoColumns).map(([letter, numbers]) => (
            <div key={letter} className="column">
              <div className="header">{letter}</div>
              {numbers.map((num) => (
                <div
                  key={num}
                  className={`cell ${drawn.includes(num) ? "drawn" : ""}`}
                >
                  {num}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* STYLES */}
      <style jsx>{`
        .container {
          min-height: 100vh;
          width: 100vw;
          max-width: 100%;
          margin: 0;
          padding: 20px;
          box-sizing: border-box;
          overflow-x: hidden;
          background: radial-gradient(circle at top, #2c3e50, #0f2027);
          color: white;
          font-family: "Segoe UI", sans-serif;
        }

        .title {
          text-align: center;
          margin-bottom: 20px;
          font-size: 2rem;
        }

        .content {
          display: flex;
          flex-direction: row;
          gap: 40px;
          justify-content: center;
          align-items: center;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .left {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          flex: 3;
          width: 75%;
        }

        .ball {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: radial-gradient(circle at top, #ffffff, #e74c3c);
          box-shadow: 0 0 30px rgba(231, 76, 60, 0.8);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .ball.final {
          transform: scale(1.1);
          box-shadow: 0 0 45px rgba(255, 215, 0, 1);
        }

        .letter {
          font-size: 2.5rem;
        }

        .number {
          font-size: 4rem;
        }

        .buttons {
          display: flex;
          gap: 12px;
        }

        .btn {
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #f39c12, #f1c40f);
          font-weight: bold;
          cursor: pointer;
        }

        .reset {
          background: linear-gradient(135deg, #c0392b, #e74c3c);
          color: white;
        }

        /* BINGO BOARD */
        .board {
          display: grid;
          grid-template-columns: repeat(5, 60px);
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          padding: 12px;
          border-radius: 12px;
          flex: 1;
          width: 25%;
        }

        .column {
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: center;
        }

        .header {
          font-size: 1.2rem;
          font-weight: bold;
          color: #f1c40f;
          margin-bottom: 4px;
        }

        .cell {
          width: 50px;
          height: 40px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.15);
          font-size: 0.9rem;
        }

        .cell.drawn {
          background: #2ecc71;
          color: black;
          font-weight: bold;
          box-shadow: 0 0 8px rgba(46, 204, 113, 0.9);
        }
      `}</style>
    </main>
  );
}
