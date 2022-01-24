const fetch = require('node-fetch');
const fs = require('fs');
const PDFDocument = require('pdfkit');

//console.log(`?x=${encodeURIComponent('project = IC AND component = Infrastructure')}`);

//Note &startAt=NUM will allow you to use pagination.

//It is worth mentioning that this task would be made more production friendly if we were enabled / allowed to use jira's API endpoint for JQL queries:
//https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-jql/#api-rest-api-3-jql-parse-post

//Get components, with no lead and add them to an array.
const getNonLeadComponents = () => {
    return fetch('https://herocoders.atlassian.net/rest/api/3/project/IC/components')
    .then(res => res.json())
    .then(json => {
        //return array of only components without leads
        return json.filter(val => !val.lead);

    });
}

//will fetch and return individual issues
const fetchIssues = async (project, component) => {
    return fetch("https://herocoders.atlassian.net/rest/api/3/search?jql="+prepUrlEncodeJQL(project, component))
    .then(res => res.json())
    .then(json => {
        return json.issues
    })
}

//print to PDF now that we have all the compiled values
const printComponent = (value) => {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream('./'+Date.now()+'_'+value.name+'_component_summary.pdf'));

    doc.fontSize(13);
    doc.text(`Component Name: ${value.name} part of project: ${value.project}`, {
        align: 'center'
    });

    doc.moveDown();
    doc.fontSize(10);
    doc.text('Linked Issues:')

    
    doc.fontSize(8)
    value.issues.forEach(el => {
        doc.moveDown();
        doc.text(`Issue Key: ${el.key}, issue type: ${el.fields.issuetype.name}`)
        doc.text(`${el.fields.summary}`)
        doc.text(`Status: ${el.fields.status.name}`)
        //doc.text(`Assigned: ${el.fields.assignee.displayName}`)
    })

    doc.end();

    console.log('printed component '+value.name);
}

//fetch issues related to nonLead components
const runComponentIssues = async () => {
    const nonLeads = await getNonLeadComponents();

    nonLeads.forEach(async component => {
       component.issues = await fetchIssues(component.project, component.name)
       printComponent(component);
    });
}

const prepUrlEncodeJQL = (project, component) => {
    return encodeURIComponent("project = "+project+" AND component = '"+component+"'");
}


module.exports = {
    getNonLeadComponents: getNonLeadComponents,
    runComponentIssues: runComponentIssues,
    prepUrlEncodeJQL: prepUrlEncodeJQL,
}
