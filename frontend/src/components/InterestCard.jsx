function InterestCard({ interest, selected, toggle }) {
  return (
    <div
      className={`interest-card ${selected ? "selected" : ""}`}
      onClick={() => toggle(interest)}
    >
      {interest}
    </div>
  );
}

export default InterestCard;