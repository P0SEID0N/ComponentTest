const {prepUrlEncodeJQL} =  require('../js/componentChecker')

test('Expect JQL url to be equal', async () => {
    expect(prepUrlEncodeJQL('IC', 'Infrastructure')).toEqual("project%20%3D%20IC%20AND%20component%20%3D%20'Infrastructure'&startAt=0")
    expect(prepUrlEncodeJQL('TEST', 'TESTING')).toEqual("project%20%3D%20TEST%20AND%20component%20%3D%20'TESTING'&startAt=0")
    expect(prepUrlEncodeJQL('IC', 'Infrastructure', 6)).toEqual("project%20%3D%20IC%20AND%20component%20%3D%20'Infrastructure'&startAt=6")
    expect(prepUrlEncodeJQL('TEST', 'TESTING', 200)).toEqual("project%20%3D%20TEST%20AND%20component%20%3D%20'TESTING'&startAt=200")
})