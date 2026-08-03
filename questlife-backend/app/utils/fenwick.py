"""Fenwick Tree (Binary Indexed Tree) implementation for O(log N) order statistics & rank maintenance."""

from typing import List


class FenwickTree:
    """
    Binary Indexed Tree (BIT) for dynamic frequency counting and rank queries.
    Allows O(log M) point updates and O(log M) prefix sum queries.
    """

    def __init__(self, max_val: int = 100000):
        self.size = max_val + 1
        self.tree: List[int] = [0] * self.size
        self.total_count = 0

    def add(self, index: int, delta: int = 1) -> None:
        """Add delta count to given score index in O(log M)."""
        idx = max(1, min(index, self.size - 1))
        self.total_count += delta
        while idx < self.size:
            self.tree[idx] += delta
            idx += idx & (-idx)

    def query(self, index: int) -> int:
        """Query prefix sum [1..index] (number of scores <= index) in O(log M)."""
        if index <= 0:
            return 0
        idx = min(index, self.size - 1)
        count = 0
        while idx > 0:
            count += self.tree[idx]
            idx -= idx & (-idx)
        return count

    def get_rank(self, score: int) -> int:
        """
        Get 1-based rank for a given score (1 = highest score).
        Rank = Total users - (Users with score <= given score) + 1.
        Runs in O(log M).
        """
        if self.total_count == 0:
            return 1
        scores_less_or_equal = self.query(score)
        scores_strictly_greater = self.total_count - scores_less_or_equal
        return scores_strictly_greater + 1

    def get_percentile(self, score: int) -> float:
        """
        Calculate percentile ranking for a score in O(log M).
        Returns a float between 0.0 and 100.0 (100 = highest).
        """
        if self.total_count <= 1:
            return 100.0
        scores_less_or_equal = self.query(score)
        percentile = (scores_less_or_equal / self.total_count) * 100.0
        return round(min(100.0, max(0.0, percentile)), 1)
