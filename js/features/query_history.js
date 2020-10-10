const paramNames = [
    // common
    'qt', 'q', 'fq', 'sort', 'start', 'rows', 'fl', 'df', 'custom_parameters', 'wt', 'indent', 'debugQuery',
    // dismax
    'dismax', 'q_alt', 'qf', 'mm', 'pf', 'ps', 'tie', 'bq', 'bf',
    // edismax
    'edismax', 'edismax_q_alt', 'edismax_qf', 'edismax_mm', 'edismax_pf', 'edismax_ps', 'edismax_tie', 'edismax_bq', 'edismax_bf',
    'edismax_uf', 'edismax_pf2', 'edismax_pf3', 'edismax_ps2', 'edismax_ps3', 'edismax_boost', 'edismax_stopwords', 'edismax_lowercaseOperators',
    // hl
    'hl', 'hl_fl', 'hl_simple_pre', 'hl_simple_post', 'hl_requireFieldMatch', 'hl_usePhraseHighlighter', 'hl_highlightMultiTerm',
    // facet
    'facet', 'facet_query', 'facet_field', 'facet_prefix',
    // spatial
    'spatial', 'pt', 'sfield', 'd',
    // spellcheck
    'spellcheck', 'spellcheck_build', 'spellcheck_reload', 'spellcheck_q', 'spellcheck_dictionary', 'spellcheck_count', 'spellcheck_onlyMorePopular',
    'spellcheck_extendedResults', 'spellcheck_collate', 'spellcheck_maxCollations', 'spellcheck_maxCollationTries', 'spellcheck_accuracy',
]

function getFormParameters() {
    const params = {}
    params['_query'] = decodeURIComponent($('#url').text().replace(/^.+\?/, ''))
    params['_host'] = location.host
    params['_index'] = location.href.match(/#\/(?<index>.+?)\//).groups.index
    params['_datetime'] = `${new Date().toLocaleString()}`
    paramNames.forEach(name => {
        if (name === 'fq') {
            params[name] = $('[id="fq"]').toArray().map(e => $(e).val())
            return
        }

        const input = $('#' + name)
        if (input.prop('type') === 'checkbox') {
            params[name] = input.is(':checked')
            return
        }

        params[name] = input.val()
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

    paramNames.forEach(name => {
        if (name === 'fq') {
            while (params['fq'].length > $('[id="fq"]').length) {
                $('#fq').parent().find('.add')[0].click()
            }

            $('[id="fq"]').each((i, e) => updateValue($(e), params['fq'][i]))
            return
        }

        const input = $('#' + name)
        // checkbox toggled
        if (input.prop('type') === 'checkbox' && input.prop('checked') ^ params[name]) {
            input.click()
            return
        }

        updateValue(input, params[name])
    })
}

function updateHistoryList(history) {
    if ($('#history select').length) {
        $('#history select').empty()
    } else {
        $('<div id="history"><select></select></div>').insertBefore('#form')
    }

    history
        .filter(params => params['_host'] === location.host)
        .forEach(params => {
            const historyItem = $(`<option>[${params['_datetime']}] ${params['_query']}</option>`)
            historyItem.attr('data-params', JSON.stringify(params))
            $('#history select').prepend(historyItem)
        })

    const defaultItem = $('<option> -- select a history --</option>')
    defaultItem.prop('selected', true)
    $('#history select').prepend(defaultItem)

    $('#history select').on('change', (e) => {
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
    const isSameParams = (a, b) => a['_query'] === b['_query'] && a['_host'] == b['_host']

    const url = document.getElementById('url')
    const observer = new MutationObserver(() => {
        const history = getHistory()
        const params = getFormParameters()
        // default query or same query excuted
        if (params['_query'] === "q=*:*" || isSameParams(history[history.length - 1], params)) {
            return
        }

        history.push(params)
        if (history.length > 100) {
            history.shift()
        }

        setHistory(history)
        updateHistoryList(history)
    })

    const options = {
        attributes: false,
        childList: true,
        subtree: true,
        characterData: true
    }
    observer.observe(url, options)

    updateHistoryList(getHistory())
}