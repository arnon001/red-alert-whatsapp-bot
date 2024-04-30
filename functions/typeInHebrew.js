function typeInHebrew (type) {
    switch (type) {
        case missiles:
            return "ירי טילים ורקטות";
        case general:
            return "אירוע כללי";
        case radiologicalEvent:
            return "אירוע רדיולוגי";
        case earthQuake: 
            return "רעידת אדמה";
        case tsunami:
            return "צונאמי";
        case hostileAircraftIntrusion:
            return "חדירת כלי טייס עויינים";
        case hazardousMaterials:
            return "חומרים מסוכנים";
        case terroristInfiltration:
            return "חשש לחדירת מחבלים";
        case missilesDrill:
            return "אימון של ירי טילים ורקטות";
        case earthQuakeDrill:
            return "אימון של רעידת אדמה";  
        case hostileAircraftIntrusionDrill:
            return "אימון של חדירת כלי טיס עויינים";
        case hazardousMaterialsDrill:
            return "אימון של אירוע חומרים מסוכנים";
        case terroristInfiltrationDrill:
            return "אימון של חדירת מחבלים";
        default:
            return "לא ידוע";
    }
    
}
module.exports = { typeInHebrew };
