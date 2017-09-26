import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

// Your retrieve function plus any additional functions go here ...
const LIMIT = 10;
let requestedPage = 1;

const retrieve = (options = {}) => {
    const url = createURL(options);

    return fetch(url)
        .then(resp => resp.json())
        .then(mapData)
        .catch(err => {
            console.log(`Error retrieving data: ${err}`);
        });
};

function createURL (options) {
    const { page = 1, colors = [] } = options;
    const offset = getIndex(page);
    const limit = LIMIT;
    let url = new URI(window.path);

    requestedPage = page;

    url.addSearch({limit, offset })

    if (colors.length) {
        url.addSearch("color[]", colors);
    }
    return url;
}

function getIndex (page) {
    return (page - 1) * 10;
}

function mapData (data) {
    const mapped = {
        ids: [],
        open: [],
        closedPrimaryCount: 0,
        previousPage: null,
        nextPage: null
    };

    const OPEN = "open";
    const CLOSED = "closed";

    let color = null;

    data.forEach(item => {
        color = item.color;
        mapped.ids.push(item.id);

        if (item.disposition === OPEN) {
            item.isPrimary = isPrimaryColor(color);
            mapped.open.push(item);
        } else if (item.disposition === CLOSED && isPrimaryColor(color)) {
            mapped.closedPrimaryCount++;
        }
    });

    mapped.previousPage = requestedPage === 1 ? null : requestedPage - 1;
    mapped.nextPage = getNextPage(data.length);

    return mapped;
}

function getNextPage (length) {
    return (requestedPage >= 50 || !length) ? null : requestedPage + 1;
}

function isPrimaryColor (color) {
    return color === "red" || color === "blue" || color === "yellow";
}

export default retrieve;
