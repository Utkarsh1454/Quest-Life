"""Unit tests for Fenwick Tree order statistics implementation."""

from app.utils.fenwick import FenwickTree


def test_fenwick_tree_basic_add_and_query():
    ft = FenwickTree(max_val=1000)
    scores = [100, 200, 300, 400, 500]
    for s in scores:
        ft.add(s, 1)

    assert ft.total_count == 5
    assert ft.query(100) == 1
    assert ft.query(300) == 3
    assert ft.query(500) == 5
    assert ft.query(50) == 0


def test_fenwick_tree_rank_and_percentile():
    ft = FenwickTree(max_val=1000)
    # Add scores: 50, 100, 150, 200, 250
    scores = [50, 100, 150, 200, 250]
    for s in scores:
        ft.add(s, 1)

    # Highest score (250) -> Rank 1
    assert ft.get_rank(250) == 1
    # Score 200 -> Rank 2 (only 250 is > 200)
    assert ft.get_rank(200) == 2
    # Score 50 -> Rank 5
    assert ft.get_rank(50) == 5

    # Percentiles:
    assert ft.get_percentile(250) == 100.0
    assert ft.get_percentile(50) == 20.0
