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

function trimParentheses(filter) {
    const parenDiff = text => text.split(/\(/g).length - text.split(/\)/g).length;

    let diff;
    filter = filter.replace(/\^\d+$/, '')
    while ((diff = parenDiff(filter)) !== 0) {
        filter = diff > 0 ? filter.trim().substr(1) : filter.trim().substr(0, filter.length - 1)
    }
    return filter
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
        if (!param) {
            return
        }

        if (id === 'fq') {
            const filters = []
            params.getAll('fq')
                .map(value => value.split(/\sAND\s/i))
                .reduce((a, b) => a.concat(b), [])
                .forEach(value => filters.push(value))
            while (filters.length > $('[id="fq"]').length) {
                $('#fq').parent().find('.add')[0].click()
            }

            $('[id="fq"]').each((i, e) => updateValue($(e), trimParentheses(filters[i])))
            return
        }

        if (input.prop('type') !== 'checkbox') {
            updateValue(input, param)
            return;
        }

        if (input.is(':checked') ^ (param === 'on' || param === 'true')) {
            input.click()
            return
        }
    })
}

function enableQueryExpansion() {
    $('<label>Query Expansion</label>\
       <div id="query_expansion">\
         <input type="text">\
         <button id="expand_query">Expand</button>\
       </div>')
    .insertBefore('#form')

    $('#expand_query').on('click', () => {
        const text = $('#query_expansion input').val()
        const queryString = extractQueryString(text)
        fillFormInputs(queryString)
    })
}