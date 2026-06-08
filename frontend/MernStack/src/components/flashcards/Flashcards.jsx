import React, { useEffect, useState } from "react";
import axios from "axios";
import { server } from "../../main";
import "./flashcards.css";
import toast from "react-hot-toast";

const RATINGS = [
  { label: "Again", quality: 2, className: "again" },
  { label: "Hard", quality: 3, className: "hard" },
  { label: "Good", quality: 4, className: "good" },
  { label: "Easy", quality: 5, className: "easy" },
];

const Flashcards = ({ lectureId }) => {
  const [cards, setCards] = useState([]);
  const [total, setTotal] = useState(0);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const headers = { headers: { token: localStorage.getItem("token") } };

  async function fetchDue() {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${server}/api/flashcards/due?lecture=${lectureId}`,
        headers,
      );
      setCards(data.flashcards);
      setTotal(data.total);
      setIndex(0);
      setFlipped(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (lectureId) fetchDue();
  }, [lectureId]);

  const generate = async () => {
    setGenerating(true);
    try {
      const { data } = await axios.post(
        `${server}/api/lecture/${lectureId}/flashcards/generate`,
        {},
        headers,
      );
      toast.success(data.cached ? "Flashcards loaded" : "Flashcards generated");
      await fetchDue();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not generate flashcards",
      );
    } finally {
      setGenerating(false);
    }
  };

  const rate = async (quality) => {
    const card = cards[index];
    try {
      await axios.post(
        `${server}/api/flashcards/${card._id}/review`,
        { quality },
        headers,
      );
    } catch (error) {
      console.log(error);
    }

    if (index + 1 < cards.length) {
      setIndex(index + 1);
      setFlipped(false);
    } else {
      setCards([]);
      setIndex(0);
      setFlipped(false);
      toast.success("Review complete!");
    }
  };

  return (
    <div className="flashcards-box">
      <div className="flashcards-header">
        <h3>Flashcards</h3>
        {cards.length > 0 && (
          <span className="due-badge">{cards.length} due</span>
        )}
      </div>

      {loading ? (
        <p className="flashcards-empty">Loading flashcards…</p>
      ) : total === 0 ? (
        <>
          <p className="flashcards-empty">
            No flashcards yet for this lecture. Generate a set to start studying.
          </p>
          <button
            className="common-btn"
            disabled={generating}
            onClick={generate}
          >
            {generating ? "Generating…" : "Generate Flashcards"}
          </button>
        </>
      ) : cards.length === 0 ? (
        <p className="flashcards-empty">
          ✅ All caught up! No cards are due right now.
        </p>
      ) : (
        <div className="flashcard-review">
          <div
            className={`flashcard ${flipped ? "flipped" : ""}`}
            onClick={() => setFlipped(!flipped)}
          >
            <span className="flashcard-side-label">
              {flipped ? "Answer" : "Question"}
            </span>
            <p className="flashcard-text">
              {flipped ? cards[index].answer : cards[index].question}
            </p>
            {!flipped && (
              <span className="flashcard-hint">Click to reveal answer</span>
            )}
          </div>

          <p className="flashcard-progress">
            Card {index + 1} of {cards.length}
          </p>

          {flipped && (
            <div className="rating-row">
              {RATINGS.map((r) => (
                <button
                  key={r.quality}
                  className={`rating-btn ${r.className}`}
                  onClick={() => rate(r.quality)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Flashcards;
