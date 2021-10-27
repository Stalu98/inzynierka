CREATE TABLE leagues (
    ID SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE teams (
    ID SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    points INT NOT NULL,
    position INT NOT NULL
);

CREATE TABLE matches (
    ID SERIAL PRIMARY KEY,
    date TIMESTAMP NOT NULL,
    goals_h INT NOT NULL,
    goals_a INT NOT NULL,
    ball_posession_h INT,
    ball_posession_a INT,
    goal_attempts_h INT,
    goal_attempts_a INT,
    shots_on_goal_h INT,
    shots_on_goal_a INT,
    shots_off_goal_h INT,
    shots_off_goal_a INT,
    blocked_shots_h INT,
    blocked_shots_a INT,
    free_kicks_h INT,
    free_kicks_a INT,
    corner_kicks_h INT,
    corner_kicks_a INT,
    offsides_h INT,
    offsides_a INT,
    throw_in_h INT,
    throw_in_a INT,
    goalkeeper_saves_h INT,
    goalkeeper_saves_a INT,
    fouls_h INT,
    fouls_a INT,
    yellow_cards_h INT,
    yellow_cards_a INT,
    total_passes_h INT,
    total_passes_a INT,
    tackles_h INT,
    tackles_a INT,
    attacks_h INT,
    attacks_a INT,
    dangerous_attacks_h INT,
    dangerous_attacks_a INT,
    id_team_home SERIAL,
    id_team_away SERIAL,        

    CONSTRAINT matches_fk_team_home FOREIGN KEY(id_team_home)
    REFERENCES teams(id)
    ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT matches_fk_team_away FOREIGN KEY(id_team_away)
    REFERENCES teams(id)
    ON UPDATE CASCADE ON DELETE CASCADE
);

