/**
 * Test script to directly test the search actions
 */

import { search } from '@/lib/tools/search'

async function testSearchAction() {
    console.log('🧪 Testing Search Action Directly')
    console.log('=================================\n')

    try {
        console.log('📝 Test 1: Basic search for "Daydreams AI"')
        const results = await search('Daydreams AI', 5, 'basic', [], [])

        console.log(`✅ Search completed`)
        console.log(`- Results found: ${results.results.length}`)
        console.log(`- Images found: ${results.images.length}`)

        if (results.results.length > 0) {
            console.log('\n📊 First result:')
            console.log(`- Title: ${results.results[0].title}`)
            console.log(`- URL: ${results.results[0].url}`)
            console.log(`- Content preview: ${results.results[0].content.substring(0, 200)}...`)
        }

        console.log('\n📝 Test 2: Advanced search for "TypeScript best practices"')
        const advancedResults = await search('TypeScript best practices', 3, 'advanced', [], [])

        console.log(`✅ Advanced search completed`)
        console.log(`- Results found: ${advancedResults.results.length}`)

        return true
    } catch (error) {
        console.error('❌ Test failed:', error)
        return false
    }
}

// Run the test
if (require.main === module) {
    testSearchAction()
        .then(success => {
            if (success) {
                console.log('\n✅ All tests passed!')
            } else {
                console.log('\n❌ Tests failed!')
                process.exit(1)
            }
        })
        .catch(console.error)
}

export { testSearchAction }
