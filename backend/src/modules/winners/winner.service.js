
import ApiError from "../../utils/ApiError.js";

const getPrizeTier = (matchCount) => {
  if (matchCount >= 5) return "five_matches";
  if (matchCount === 4) return "four_matches";
  if (matchCount === 3) return "three_matches";
  return "none";
};

export const calculateMatches = (entryNumbers, winningNumbers) => {
  if (
    !Array.isArray(entryNumbers) ||
    !Array.isArray(winningNumbers) ||
    winningNumbers.length !== 5
  ) {
    throw new ApiError(400, "Invalid entry or winning numbers");
  }

  const isValidNumbers = (numbers) =>
    numbers.every(
      (number) =>
        Number.isInteger(number) &&
        number >= 1 &&
        number <= 45
    ) && new Set(numbers).size === numbers.length;

  if (
    !isValidNumbers(entryNumbers) ||
    !isValidNumbers(winningNumbers)
  ) {
    throw new ApiError(
      400,
      "Numbers must be unique integers from 1 to 45"
    );
  }

  const matchedNumbers = entryNumbers.filter((number) =>
    winningNumbers.includes(number)
  );

  const matchCount = matchedNumbers.length;

  return {
    matchedNumbers,
    matchCount,
    prizeTier: getPrizeTier(matchCount),
  };
};
