//Imports
require("dotenv").config();
const express = require("express");
const { getLeagueName } = require("./helpers");
const app = express();
const port = 3000;

const { Client } = require("pg");

const connectionConfig = process.env.POSTGRES_URL
    ? {
          connectionString: process.env.POSTGRES_URL,
      }
    : {
          host: process.env.POSTGRES_SOCKET,
          user: "postgres",
          password: "postgre",
          database: "postgres",
      };

console.log(connectionConfig);

const client = new Client({
    ...connectionConfig,
    statement_timeout: 5000,
});

client.connect();

app.set("view engine", "ejs");

//Static files
app.use(express.static("public"));
app.use("/css", express.static(__dirname + "public/css"));
app.use("/js", express.static(__dirname + "public/js"));
app.use("/img", express.static(__dirname + "public/img"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

app.get("/league/:league", async (req, res) => {
    const league = req.params.league;
    const leagueName = getLeagueName(league);

    const { rows: teams } = await client.query(`
        SELECT 
            id, 
            name, 
            points, 
            position 
        FROM "teams" 
        WHERE league = '${league}'::league_enum 
        ORDER BY position`);

    console.log(teams);

    res.render(__dirname + `/views/league.ejs`, {
        league,
        leagueName,
        teams,
    });
});

app.get("/team/:team", async (req, res) => {
    const team = req.params.team;
    const teamName = "Team name";
    const { rows: matches } = await client.query(`
        SELECT 
            m.id AS id,
            m.date AS date, 
            m.goals_h AS homeTeamScore, 
            m.goals_a AS awayTeamScore, 
            t1.name AS homeTeam, 
            t2.name AS awayTeam 
        FROM "matches" m, "teams" t1, "teams" t2 
        WHERE 
            '${team}' IN (m.id_team_home, m.id_team_away) 
            AND t1.id = m.id_team_home 
            AND t2.id = m.id_team_away
        ORDER BY date;
    `);
    console.log(matches);

    res.render(__dirname + `/views/team.ejs`, {
        teamName,
        matches,
    });
});

app.get("/match/:match", async (req, res) => {
    const matchId = req.params.match;

    const {
        rows: [match],
    } = await client.query(`
        SELECT 
            m.date,
            m.goals_h,
            m.goals_a,
            m.ball_posession_h, 
            m.ball_posession_a, 
            m.goal_attempts_h,
            m.goal_attempts_a, 
            m.shots_on_goal_h,
            m.shots_on_goal_a,
            m.shots_off_goal_h,
            m.shots_off_goal_a,
            m.blocked_shots_h,
            m.blocked_shots_a,
            m.free_kicks_h, 
            m.free_kicks_a, 
            m.corner_kicks_h,
            m.corner_kicks_a,
            m.offsides_h,
            m.offsides_a,
            m.throw_in_h,
            m.throw_in_a,
            m.goalkeeper_saves_h,
            m.goalkeeper_saves_a,
            m.fouls_h, 
            m.fouls_a, 
            m.yellow_cards_h,
            m.yellow_cards_a,
            m.total_passes_h,
            m.total_passes_a,
            m.tackles_h, 
            m.tackles_a, 
            m.attacks_h, 
            m.attacks_a, 
            m.dangerous_attacks_h, 
            m.dangerous_attacks_a, 
            home.name AS homeTeam,
            away.name AS awayTeam
        FROM "matches" m, "teams" home, "teams" away
        WHERE m.id = '${matchId}'
            AND home.id = m.id_team_home
            AND away.id = m.id_team_away;
        `);

    console.log(match);

    res.render(__dirname + `/views/match.ejs`, {
        match,
    });
});

//Listen on port 3000
app.listen(port, () => console.info(`Listening on http://localhost:${port}`));
