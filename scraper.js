const mapMatchStats = (stats) => {
    const requiredStats = [
        "Posiadanie piłki",
        "Sytuacje bramkowe",
        "Strzały na bramkę",
        "Strzały niecelne",
        "Strzały zablokowane",
        "Rzuty wolne",
        "Rzuty rożne",
        "Spalone",
        "Wrzuty z autu",
        "Interwencje bramkarzy",
        "Faule",
        "Żółte kartki",
        "Podania",
        "Bloki",
        "Ataki",
        "Niebezpieczne ataki",
    ];

    return requiredStats.reduce((acc, statName) => {
        const nextStat = stats.find((el) => el.name === statName);

        if (nextStat === undefined) {
            acc.push(null);
            acc.push(null);
        } else {
            acc.push(nextStat.homeValue);
            acc.push(nextStat.awayValue);
        }

        return acc;
    }, []);
};

const getMatchIds = async (url, browser) => {
    const page = await browser.newPage();

    console.log(url);
    await page.goto(url);

    while (true) {
        try {
            await page.waitForSelector(".event__more");
            await page.evaluate(() => {
                document.querySelector(".event__more").click();
            });
            await page.waitForTimeout(5000);
        } catch (e) {
            break;
        }
    }

    const ids = await page.evaluate(() => {
        const matches = Array.from(
            document.querySelector(".sportName ").children
        );
        const ids = matches
            .filter((el) => el.hasAttribute("id"))
            .map((el) => el.getAttribute("id"))
            .map((id) => id.slice(4));
        return ids;
    });
    await page.close();

    return ids;
};

const getTeamsDataFromLeague = async (leagueUrl, browser) => {
    const page = await browser.newPage();
    await page.goto(leagueUrl);
    await page.waitForSelector('div[class*="ui-table__row"]');

    const teamsData = await page.evaluate(() => {
        const teams = Array.from(
            document.querySelectorAll('div[class*="ui-table__row"]')
        );
        const teamsData = teams.map((el, idx) => {
            const details = {};
            details.position = idx + 1;
            details.name = el.querySelector(
                'a[class*="tableCellParticipant__name"]'
            ).innerText;
            details.points = el.querySelector("span:last-of-type").innerText;

            return details;
        });
        return teamsData;
    });
    await page.close();

    return teamsData;
};

const getMatchData = async (id, browser) => {
    const page = await browser.newPage();
    console.log(id);
    await page.goto(
        `https://www.flashscore.pl/mecz/${id}/#szczegoly-meczu/statystyki-meczu/0`
    );
    await page.waitForSelector('a[class^="participant__participantName"]');

    const matchData = await page.evaluate(() => {
        const matchData = { stats: [] };
        const date = document.querySelector(
            'div[class="duelParticipant__startTime"]'
        ).children[0].innerText;
        const nameNodes = Array.from(
            document.querySelectorAll(
                'a[class^="participant__participantName"]'
            )
        );
        const goalNodes = Array.from(
            document.querySelector('div[class="detailScore__wrapper"]').children
        );

        matchData.date = date;

        const [homeTeamName, awayTeamName] = nameNodes.map(
            (node) => node.innerText
        );
        matchData.homeTeam = homeTeamName;
        matchData.awayTeam = awayTeamName;

        const [homeTeamGoals, _, awayTeamNameGoals] = goalNodes.map(
            (node) => node.innerText
        );
        matchData.homeGoals = homeTeamGoals;
        matchData.awayGoals = awayTeamNameGoals;

        const statNodes = Array.from(
            document.querySelectorAll('[class="statCategory"]')
        );
        statNodes.forEach((statNode) => {
            const [homeValue, name, awayValue] = Array.from(
                statNode.children
            ).map((stat) => stat.innerText);
            matchData.stats.push({
                name,
                homeValue: Number.parseInt(homeValue),
                awayValue: Number.parseInt(awayValue),
            });
        });

        return matchData;
    });
    await page.close();

    matchData.id = id;

    matchData.stats = mapMatchStats(matchData.stats);

    return matchData;
};

exports.getMatchIds = getMatchIds;
exports.getMatchData = getMatchData;
exports.getTeamsDataFromLeague = getTeamsDataFromLeague;
