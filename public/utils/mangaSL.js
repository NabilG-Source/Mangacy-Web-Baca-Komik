function truncateTitle(title, maxLength) {
    if (title.length <= maxLength) {
        return title;
    }
    return title.slice(0, maxLength) + ' ...';
}

function getFlagImage(flags) {
    switch (flags) {
        case "id":
            return "indonesia.png";
            break;

        case "en":
            return "english.png";
            break;
        
        case "jp":
            return "japanese.png";
            break;
        case "it": 
            return "italia.png";
            break;
        case "pt-br":
            return "brazil.png";
            break;
        default:
            return "indonesia.png";
    }
}

module.exports = {
    sliceTitle: truncateTitle,
    getFlags: getFlagImage
}