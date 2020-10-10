(function () {
    const start = () => {
        const content = document.querySelector('#content > [id]').id
        switch (content) {
            case 'query':
                enableQueryHistory()
            default:
                enableUIImprovement()
        }
    }

    const observer = new MutationObserver(mutations => {
        const contentNode = mutations
            .map(mutation => Array.from(mutation.addedNodes))
            .reduce((a, b) => a.concat(b))
            .find(node => node.id === 'content')
        if (!contentNode) {
            return
        }

        start()
    })

    const main = document.getElementById('main')
    if (!main) {
        return
    }

    const options = { childList: true, subtree: true }
    observer.observe(main, options)

    start()
})()