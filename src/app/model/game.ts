export interface Game {
    id: number,
    season: number,
    week: number,
    season_type: string,
    start_date: string,
    start_time_tbd: boolean,
    completed: boolean,
    neutral_site: boolean,
    conference_game: boolean,
    attendance: number,
    venue_id: number,
    venue: string,
    home_id: number,
    home_team: string,
    home_team_ranking?: number,
    home_conference: string,
    home_division: string,
    home_points: number,
    home_line_scores: number[],
    home_post_win_prob: string,
    home_pregame_elo: number,
    home_postgame_elo: number,
    away_id: number,
    away_team: string,
    away_team_ranking?: number,
    away_conference: string,
    away_division: string,
    away_points: number,
    away_line_scores: number[],
    away_post_win_prob: string,
    away_pregame_elo: number,
    away_postgame_elo: number,
    excitement_index: string,
    home_win_probability: number,
    highlights: any,
    notes: string
}