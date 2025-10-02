import { HalfStar, StarFilled, StarOutline } from "apps/user-ui/src/assets/svgs/star-icon";
import { FC } from "react";

type Props = {
  rating: number;
};

const Ratings: FC<Props> = ({ rating }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(<StarFilled key={`star-${i}`} />);
    } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
      stars.push(<HalfStar key={`half-${i}`} />);
    } else {
      stars.push(<StarOutline key={`empty-${i}`} />);
    }
  }

  return <div className="flex gap-1">{stars}</div>;
};

export default Ratings;
