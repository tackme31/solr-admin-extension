

function getFormParameters() {
    const params = {}
    params['_query'] = decodeURIComponent($('#url').text().replace(/^.+\?/, ''))
    params['_host'] = location.host
    params['_index'] = location.href.match(/#\/(?<index>.+?)\//).groups.index
    params['_datetime'] = `${new Date().toLocaleString()}`

    const paramIds = new Set(Array.from($('#form [name]')).map(e => e.id))
    paramIds.forEach(id => {
        if (id === 'fq') {
            params[id] = $('[id="fq"]').toArray().map(e => $(e).val())
            return
        }

        const input = $('#' + id)
        if (input.prop('type') === 'checkbox') {
            params[id] = input.is(':checked')
            return
        }

        params[id] = input.val()
    })
    return params
}

function setFormParameters(params) {
    const updateValue = (input, newValue) => {
        const oldValue = input.val()
        if (oldValue === newValue) {
            return
        }

        input.val(newValue)
        input[0].dispatchEvent(new Event("input"))
        input[0].dispatchEvent(new Event("change"))
    }

    const paramIds = new Set(Array.from($('#form [name]')).map(e => e.id))
    paramIds.forEach(id => {
        if (id === 'fq') {
            while (params['fq'].length > $('[id="fq"]').length) {
                $('#fq').parent().find('.add')[0].click()
            }

            $('[id="fq"]').each((i, e) => updateValue($(e), params['fq'][i]))
            return
        }

        const input = $('#' + id)
        // checkbox toggled
        if (input.prop('type') === 'checkbox' && input.is(':checked') ^ params[id]) {
            input.click()
            return
        }

        updateValue(input, params[id])
    })
}

function updateHistoryList(history) {
    if (!$('#history select').length) {
        $('<div id="history"><select></select></div>').insertBefore('#form')    
    }

    const historyList = $('#history select')
    historyList.empty()
    history.forEach(params => {
            const historyItem = $(`<option>[${params['_datetime']}] ${params['_query']}</option>`)
            historyItem.attr('data-params', JSON.stringify(params))
            historyList.prepend(historyItem)
        })

    const defaultItem = $('<option> -- Select a history query -- </option>')
    defaultItem.prop('selected', true)
    historyList.prepend(defaultItem)
    historyList.on('change', (e) => {
        const params = $('option:selected', e.target).data('params')
        if (!params) {
            return
        }

        setFormParameters(params)
    })
}

function enableQueryHistory() {
    const getHistory = () => JSON.parse(localStorage.getItem('solr_executed_queries') || '[]')
    const setHistory = history => localStorage.setItem('solr_executed_queries', JSON.stringify(history))
    const isSameQuery = (a, b) => a && b &&a['_query'] === b['_query'] && a['_host'] == b['_host']

    const observer = new MutationObserver(() => {
        const history = getHistory()
        const params = getFormParameters()
        if (params['_query'] === "q=*:*" || isSameQuery(history[history.length - 1], params)) {
            return
        }

        history.push(params)
        if (history.length > 100) {
            history.shift()
        }

        setHistory(history)
        updateHistoryList(history)
    })

    const url = document.getElementById('url')
    const options = {
        characterData: true,
        subtree: true
    }
    observer.observe(url, options)

    updateHistoryList(getHistory())
}