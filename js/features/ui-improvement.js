function enableUIImprovement() {
    // query history list
    $('#history select').select2({
        dropdownAutoWidth: true,
        width: 'resolve',
        templateResult: state => {
            const params = $(state.element).data('params')
            if (!params) {
                return
            }

            const url = `http://${location.hostname}?${params['_query']}`
            const highlighted = urlhighlight({ url: url, protocol: ' ', protocolDelimiter: ' ', host: ' ', queryDelimiter: ' ' })
            return $(`<span>[${params['_datetime']}] ${decodeURIComponent(highlighted.trim())}</span>`)
        }
    })
}