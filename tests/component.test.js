const { test, expect } = require('@jest/globals')
const {prepUrlEncodeJQL} =  require('../js/componentChecker')

test('Expect JQL url to be equal', async () => {
    expect(prepUrlEncodeJQL('IC', 'Infrastructure')).toEqual("project%20%3D%20IC%20AND%20component%20%3D%20'Infrastructure'")
    expect(prepUrlEncodeJQL('TEST', 'TESTING')).toEqual("project%20%3D%20TEST%20AND%20component%20%3D%20'TESTING'")
})