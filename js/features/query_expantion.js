function extractQueryString(queryString) {
    if (!queryString) {
        return
    }

    if (queryString.startsWith('http')) {
        return queryString.replace(/^.+\?/, '')
    }
    
    if (queryString.startsWith('?')) {
        return queryString.replace(/^\?/, '')
    }

    return queryString
}

function fillFormInputs(queryString) {
    const updateValue = (input, newValue) => {
        const oldValue = input.val()
        if (oldValue === newValue) {
            return
        }

        input.val(newValue)
        input[0].dispatchEvent(new Event("input"))
        input[0].dispatchEvent(new Event("change"))
    }

    // remove all filter queries
    const params = new URLSearchParams(queryString)
    while ($('[id="fq"]').length > 1) {
        $('#fq').parent().find('.rem')[0].click()
    }

    const paramIds = new Set(Array.from($('#form [name]')).map(e => e.id))
    paramIds.forEach(id => {
        const input = $('#' + id)
        const param = params.get(input.prop('name'))

        if (id === 'fq') {
            const filters = []
            params.getAll('fq')
                .map(value => value.split(/\sAND\s/i))
                .reduce((a, b) => a.concat(b))
                .forEach(value => filters.push(value))

            while (filters.length > $('[id="fq"]').length) {
                $('#fq').parent().find('.add')[0].click()
            }

            $('[id="fq"]').each((i, e) => updateValue($(e), filters[i]))
        }

        if (input.prop('type') === 'checkbox' && input.is(':checked') ^ (param === 'on')) {
            input.click()
        }

        updateValue(input, param)
    })
}

function enableQueryExpantion() {
    $('<div id="query_expantion">\
         <input type="text">\
         <button id="expand_query">Expand</button>\
       </div>')
    .insertBefore('#form')

    $('#expand_query').on('click', () => {
        const text = $('#query_expantion input').val()
        const queryString = extractQueryString(text)
        fillFormInputs(queryString)
    })
}