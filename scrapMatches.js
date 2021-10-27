const { Client } = require("pg");
const connectionString =
    "postgressql://postgres:postgres@localhost:5433/postgres";
const scraper = require("./scraper");
const puppeteer = require("puppeteer");

const client = new Client({
    connectionString: connectionString,
});

const season = "-2020-2021";
const headlessMode = true;

const leagues = [
    {
        name: "premierleague",
        url: `https://www.flashscore.pl/pilka-nozna/anglia/premier-league${season}/`,
    },
    {
        name: "bundesliga",
        url: `https://www.flashscore.pl/pilka-nozna/niemcy/bundesliga${season}/`,
    },
    {
        name: "seriea",
        url: `https://www.flashscore.pl/pilka-nozna/wlochy/serie-a${season}/`,
    },
    {
        name: "laliga",
        url: `https://www.flashscore.pl/pilka-nozna/hiszpania/laliga${season}/`,
    },
    {
        name: "ligue1",
        url: `https://www.flashscore.pl/pilka-nozna/francja/ligue-1${season}/`,
    },
];

(async () => {
    const browser = await puppeteer.launch({ headless: headlessMode });

    await client.connect();
    await client.query('SET DATESTYLE = ISO, DMY');


    const ids = (
        await Promise.allSettled(
            leagues
                .map(({ url }) => url + "wyniki/")
                .map((url) => scraper.getMatchIds(url, browser))
        )
    ).reduce((acc, result) => [...acc, ...result.value], []);

    console.log(ids);

    const matchResults = [];
    for (let i = 0; i < ids.length; i += 5) {
        const results = await Promise.allSettled(
            ids.slice(i, i + 5).map((id) => scraper.getMatchData(id, browser))
        );
        console.log(results);
        const resultsChunk = results.map((result) => result.value);
        console.log(resultsChunk);
        matchResults.push(...resultsChunk);
    }

    matchResults.forEach(async (match) => {
        const { id: homeTeamId } = (
            await client.query(`SELECT id FROM teams WHERE name=$1`, [
                match.homeTeam,
            ])
        ).rows[0];
        const { id: awayTeamId } = (
            await client.query(`SELECT id FROM teams WHERE name=$1`, [
                match.awayTeam,
            ])
        ).rows[0];

        client.query(
            `INSERT INTO matches VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37)`,
            [
                match.date,
                match.homeGoals,
                match.awayGoals,
                ...match.stats,
                homeTeamId,
                awayTeamId,
            ],
            (err, res) => {
                console.log(err, res);
            }
        );
    });
})();
