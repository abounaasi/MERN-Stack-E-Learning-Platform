import React from "react";
import { FaStar } from "react-icons/fa";
import "./starRating.css";

const StarRating = ({
  value = 0,
  onChange,
  size = 16,
  readonly = false,
}) => {
  const [hover, setHover] = React.useState(0);
  const stars = [1, 2, 3, 4, 5];
  const display = hover || value;

  return (
    <span
      className={`star-rating${readonly ? " readonly" : ""}`}
      role={readonly ? "img" : "group"}
      aria-label={readonly ? `${value} out of 5 stars` : "Rate this course"}
      onMouseLeave={() => !readonly && setHover(0)}
    >
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn${star <= display ? " filled" : ""}`}
          style={{ fontSize: size }}
          disabled={readonly}
          onMouseEnter={() => !readonly && setHover(star)}
          onClick={() => !readonly && onChange?.(star)}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
        >
          <FaStar />
        </button>
      ))}
    </span>
  );
};

export default StarRating;
