const fetch = require('node-fetch');

//It is worth mentioning that this task would be made more production friendly if we were enabled / allowed to use jira's API endpoint for JQL queries:
//https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-jql/#api-rest-api-3-jql-parse-post

//Get components, with no lead and add them to an array.
const getNonLeadComponents = () => {
    //Note, startAt param doesnt seem to work on this endpoint. With the current dataset available from this endpoint I cant tell if there is a pagination ability here.
    //It was mentioned that there are usually more components than issues, so I would implement pagination here as well.
    return fetch('https://herocoders.atlassian.net/rest/api/3/project/IC/components')
    .then(res => res.json())
    .then(json => {
        //return array of only components without leads
        return json.filter(val => !val.lead);
    })
    .catch(error => console.log('An error occured in the fetch operation '+error));
}

//will fetch and return individual issues
const fetchIssues = async (project, component, startAt = 0, res = []) => {
    return fetch("https://herocoders.atlassian.net/rest/api/3/search?jql="+prepUrlEncodeJQL(project, component, startAt))
    .then(res => res.json())
    .then(async json => {
        //merge the previous result with the new result and continue.
        if(json.issues.length > 0) {

            res = res.concat(json.issues);

            if(json.issues.length == json.maxResults) {
                //We have hit a page, recursively call the request
                return await fetchIssues(project, component, startAt+(json.maxResults+1), res);
            }
            else {
                return res;
            }
        }
        else {
            console.log("ERROR: The issue array has a size of 0 or is undefined");
        }
    })
    .catch(error => console.log('ERROR: An error occured in the fetch operation. '+error));
}

const printComponent = (component) => {
    console.log(`------ COMPONENT: ${component.name} PROJECT: ${component.project}------`);
    console.log(`Linked Issues: ${component.issues.length}`);
    component.issues.forEach(el => {
        console.log(`Issue Key: ${el.fields.summary} | issue type: ${el.fields.issuetype.name}`);
        console.log(`Status: ${el.fields.status.name}`);
        console.log(el.fields.summary);
    })
    console.log(`---------- END OF ${component.name} COMPONENT ----------`);
    console.log('\n');
}

//fetch issues related to nonLead components
const runProj = async () => {
    console.log('BELOW ARE ALL OF THE COMPONENTS THAT DO NOT HAVE A LEAD ASSIGNED\n');
    const nonLeads = await getNonLeadComponents();

    nonLeads.forEach(async component => {
       component.issues = await fetchIssues(component.project, component.name)
       printComponent(component);
    });
}

const prepUrlEncodeJQL = (project, component, startAt = 0) => {
    uriEncode = encodeURIComponent("project = "+project+" AND component = '"+component+"'");
    return uriEncode+`&startAt=${startAt}`;
}


module.exports = {
    runProj: runProj,
    prepUrlEncodeJQL: prepUrlEncodeJQL,
}
