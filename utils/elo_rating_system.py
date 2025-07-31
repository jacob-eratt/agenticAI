import os
import csv
import json
import random
from collections import defaultdict
from trueskill import Rating, rate_1vs1

# === Player Rating and Matchmaking System ===
class SwissTournament:
    def __init__(self, player_names, elo_window=100):
        self.ratings = {p: Rating() for p in player_names}
        self.players = list(player_names)
        self.used_matches = set()
        self.round = 0
        self.elo_window = elo_window
        self.match_history = []

    def pair_players(self):
        sorted_players = sorted(self.players, key=lambda p: self.ratings[p].mu, reverse=True)
        unmatched = set(sorted_players)
        matchups = []

        # Phase 1: Match within elo_window
        while unmatched:
            p1 = unmatched.pop()
            found = False
            for p2 in list(unmatched):
                if abs(self.ratings[p1].mu - self.ratings[p2].mu) <= self.elo_window and (p1, p2) not in self.used_matches and (p2, p1) not in self.used_matches:
                    matchups.append((p1, p2))
                    unmatched.remove(p2)
                    self.used_matches.add((p1, p2))
                    found = True
                    break
            if not found:
                unmatched.add(p1)
                break

        # Phase 2: Greedy match leftovers
        leftovers = list(unmatched)
        while len(leftovers) >= 2:
            p1 = leftovers.pop(0)
            p2 = min(leftovers, key=lambda p: abs(self.ratings[p1].mu - self.ratings[p].mu))
            leftovers.remove(p2)
            matchups.append((p1, p2))
            self.used_matches.add((p1, p2))

        bye = leftovers[0] if leftovers else None
        return matchups, bye

    def report_results(self, results):
        for result in results:
            if len(result) == 3:
                winner, loser, draw = result
                if loser is None:  # Bye: treat as a win for the player
                    # Award a nominal win (could increment a counter or adjust rating)
                    self.match_history.append((winner, "BYE", False))
                    # Optionally: boost rating slightly or leave unchanged
                    continue
                r1 = self.ratings[winner]
                r2 = self.ratings[loser]
                if draw:
                    new_r1, new_r2 = rate_1vs1(r1, r2, drawn=True)
                else:
                    new_r1, new_r2 = rate_1vs1(r1, r2)
                self.ratings[winner] = new_r1
                self.ratings[loser] = new_r2
                self.match_history.append((winner, loser, draw))

    def get_rankings(self):
        return sorted(
            [(player, rating.mu) for player, rating in self.ratings.items()],
            key=lambda x: x[1],
            reverse=True
        )
