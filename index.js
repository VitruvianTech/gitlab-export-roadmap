import fs from 'fs';
import dotenv from 'dotenv';
import csv from 'csv-export';
import { ExportToCsv } from 'export-to-csv';
import { GroupsBundle } from '@gitbeaker/node';

dotenv.config();

const WORKING_DAYS_PER_WEEK = process.env.WORKING_DAYS_PER_WEEK || 5;

// https://www.npmjs.com/package/export-to-csv
const CSV_OPTIONS = {
    useKeysAsHeaders: true
};

const die = (msg, status = 1) => {
    console.error(msg);
    process.exit(status);
}

const dateDiff = (start, end) => Math.ceil(Math.abs(new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));

const workingDays = days => days - parseInt(days / 7) * (7 % WORKING_DAYS_PER_WEEK);

const sortEpics = (a, b) => a.due_date > b.due_date ? 1 : -1;

const mapEpic = version => epic => ({
    "Version": version,
    "Epic": epic.title,
    "Effort (Days)": workingDays(dateDiff(epic.start_date, epic.due_date)),
    "Target Date": epic.due_date,
    "Start Date": epic.start_date
});

const filterEpics = (version, epics) => {
    try {
        const [{ id: parent }] = epics.filter(({ title }) => title === version);

        return epics
            .filter(({ parent_id }) => parent_id === parent)
            .sort(sortEpics)
            .map(mapEpic(version));
    } catch(e) {
        if(e instanceof TypeError) {
            console.warn(`No epics found for version "${version}".`);
        } else {
            console.error(e);
        }

        return [];
    }
};

const fetchEpics = async (group, client) => {
    console.log('Fetching epics...');

    try {
        return await client.Epics.all(group);
    } catch(e) {
        die(e);
    }
};

const generate = (versions, epics) => {
    epics = versions.map(version => filterEpics(version, epics)).flat();

    !epics.length && die('No roadmap to generate.');

    console.log('Generating roadmap...');

    try {
        !fs.existsSync('./export') && fs.mkdirSync('./export');

        return fs.writeFileSync(`./export/roadmap-${versions.join('-')}.csv`, new ExportToCsv(CSV_OPTIONS).generateCsv(epics, true));
    } catch(e) {
        die(e);
    }
};

const versions = process.argv.slice(2, process.argv.length);

!versions.length && die('USAGE: node index.js roadmap_version_1 [roadmap_version_2] [...]');

generate(versions, await fetchEpics(process.env.GROUP_ID, new GroupsBundle({ token: process.env.TOKEN })));

console.log('Done.');